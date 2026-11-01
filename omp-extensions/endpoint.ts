import { getAgentDir } from "@oh-my-pi/pi-coding-agent";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

type ModelConfig = { id: string; name?: string; contextWindow: number; maxTokens: number; [key: string]: unknown };
type ProviderConfig = { baseUrl: string; api: string; auth?: string; apiKey?: string; authHeader?: boolean; models?: ModelConfig[]; [key: string]: unknown };
type Config = { providers?: Record<string, ProviderConfig>; [key: string]: unknown };
type ConfigFile = { dir: string; path: string; original: string | undefined; config: Config; providers: Record<string, ProviderConfig> };

async function readOptional(path: string): Promise<string | undefined> {
  try { return await readFile(path, "utf8"); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

async function loadConfig(): Promise<ConfigFile> {
  const dir = getAgentDir();
  const yml = join(dir, "models.yml");
  const yaml = join(dir, "models.yaml");
  const ymlText = await readOptional(yml);
  const yamlText = ymlText === undefined ? await readOptional(yaml) : undefined;
  const path = ymlText !== undefined || yamlText === undefined ? yml : yaml;
  const original = ymlText ?? yamlText;
  if (original === undefined && await readOptional(join(dir, "models.json")) !== undefined) {
    throw new Error("Existe models.json legado. Inicie o OMP para migrá-lo antes de usar /endpoint.");
  }
  const config = (original?.trim() ? Bun.YAML.parse(original) : {}) as Config;
  if (config === null || typeof config !== "object" || Array.isArray(config)) throw new Error("O arquivo de modelos não contém um objeto YAML.");
  if (config.providers !== undefined && (config.providers === null || typeof config.providers !== "object" || Array.isArray(config.providers))) throw new Error("O campo providers não é um objeto YAML.");
  config.providers ??= {};
  return { dir, path, original, config, providers: config.providers };
}

async function saveConfig(file: ConfigFile, ctx, description: string): Promise<boolean> {
  const warning = file.original === undefined ? "" : "\nO YAML será reformatado e comentários serão removidos.";
  if (!await ctx.ui.confirm("Confirmar alteração?", `${description}\nArquivo: ${file.path}${warning}`)) return false;
  await mkdir(file.dir, { recursive: true });
  if (await readOptional(file.path) !== file.original) throw new Error("O arquivo foi alterado durante a operação. Execute /endpoint novamente.");
  const temp = join(file.dir, `.models-${randomUUID()}.tmp`);
  try {
    await writeFile(temp, Bun.YAML.stringify(file.config), { encoding: "utf8", flag: "wx", mode: 0o600 });
    await rename(temp, file.path);
  } finally { await unlink(temp).catch(() => {}); }
  return true;
}

function positiveInteger(value: unknown): number | undefined {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : undefined;
}

async function discoverModels(provider: ProviderConfig): Promise<{ models: ModelConfig[]; fallback: number }> {
  const base = new URL(provider.baseUrl.endsWith("/") ? provider.baseUrl : `${provider.baseUrl}/`);
  if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new Error("URL base inválida.");
  const headers: Record<string, string> = {};
  if (provider.auth !== "none") {
    const key = provider.apiKey;
    if (!key || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || !process.env[key]) throw new Error("Defina a variável de ambiente da chave antes de buscar modelos. Chaves literais e comandos não são usados pela extensão.");
    headers.Authorization = `Bearer ${process.env[key]}`;
  }
  const response = await fetch(new URL("models", base), { headers, signal: AbortSignal.timeout(10000), redirect: "error" });
  if (!response.ok) throw new Error(`Falha ao consultar /models: HTTP ${response.status}.`);
  const body = await response.json() as { data?: unknown };
  if (!body || !Array.isArray(body.data)) throw new Error("Resposta /models inválida: esperado um array data.");
  const nativeUrl = new URL(base);
  nativeUrl.pathname = nativeUrl.pathname.replace(/\/v1\/$/, "/api/v1/models");
  const native = new Map<string, any>();
  if (nativeUrl.pathname !== base.pathname) {
    try {
      const res = await fetch(nativeUrl, { headers, signal: AbortSignal.timeout(5000), redirect: "error" });
      if (res.ok) {
        const json = await res.json() as { models?: unknown };
        if (Array.isArray(json?.models)) for (const item of json.models) {
          if (item && typeof item.key === "string") native.set(item.key, item);
        }
      }
    } catch { /* Native metadata is optional for OpenAI-compatible servers. */ }
  }
  const previous = new Map((Array.isArray(provider.models) ? provider.models : []).filter(m => m && typeof m.id === "string").map(m => [m.id, m]));
  const seen = new Set<string>();
  const models: ModelConfig[] = [];
  let fallback = 0;
  for (const entry of body.data) {
    if (!entry || typeof entry !== "object" || typeof entry.id !== "string" || !entry.id.trim() || seen.has(entry.id)) continue;
    const meta = native.get(entry.id);
    if (meta && meta.type !== "llm") continue;
    seen.add(entry.id);
    const old = previous.get(entry.id);
    const context = positiveInteger(meta?.loaded_instances?.[0]?.loaded_context_length) ?? positiveInteger(meta?.max_context_length) ?? positiveInteger(entry.context_length) ?? positiveInteger(entry.max_model_len) ?? positiveInteger(old?.contextWindow);
    if (!context) fallback++;
    const contextWindow = context ?? 128000;
    const maxTokens = Math.min(positiveInteger(entry.max_output_tokens) ?? positiveInteger(old?.maxTokens) ?? 8192, contextWindow);
    models.push({
      ...old, id: entry.id,
      ...(typeof meta?.display_name === "string" ? { name: meta.display_name } : {}),
      ...(typeof meta?.capabilities?.vision === "boolean" ? { input: meta.capabilities.vision ? ["text", "image"] : ["text"] } : {}),
      ...(Array.isArray(meta?.capabilities?.reasoning?.allowed_options) ? { reasoning: meta.capabilities.reasoning.allowed_options.includes("on") } : {}),
      contextWindow, maxTokens,
    });
  }
  if (models.length === 0) throw new Error("Nenhum modelo de chat foi encontrado; nenhuma alteração foi feita.");
  return { models, fallback };
}

export default function endpointExtension(pi) {
  pi.registerCommand("endpoint", {
    description: "Cadastrar, atualizar ou excluir endpoints e modelos",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) return;
      const input = async (title: string, validate: (value: string) => boolean, hint: string) => {
        for (;;) {
          const value = await ctx.ui.input(title);
          if (value === undefined) return undefined;
          const trimmed = value.trim();
          if (validate(trimmed)) return trimmed;
          ctx.ui.notify(hint, "warning");
        }
      };
      const validUrl = (value: string) => {
        try {
          const url = new URL(value);
          return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password && !url.search && !url.hash && !/\/(chat\/completions|responses|models)\/?$/.test(url.pathname);
        } catch { return false; }
      };
      try {
        const action = await ctx.ui.select("Gerenciar endpoints", ["Conectar LM Studio (sem chave)", "Cadastrar e buscar modelos", "Cadastrar modelo manualmente", "Atualizar modelos", "Renomear provedor", "Excluir modelo ou provedor"]);
        if (!action) return;
        const file = await loadConfig();
        let provider: string | undefined;
        if (action === "Conectar LM Studio (sem chave)" || action === "Cadastrar e buscar modelos" || action === "Cadastrar modelo manualmente") {
          const quick = action === "Conectar LM Studio (sem chave)";
          if (!quick) {
            provider = await input("ID do provedor (ex.: lm-local)", v => /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(v), "Use letras, números, hífen ou underscore.");
            if (!provider) return;
          }
          const url = await input("URL base (ex.: http://localhost:1235/v1)", validUrl, "Informe uma URL HTTP(S) base, sem credenciais ou /models.");
          if (!url) return;
          if (quick) provider = "lm-studio";
          if (!provider) return;
          if (Object.hasOwn(file.providers, provider)) throw new Error(`O provedor '${provider}' já existe; use Atualizar modelos.`);
          const api = quick ? "openai-completions" : await ctx.ui.select("API compatível", ["openai-completions", "openai-responses"]);
          if (!api) return;
          const auth = quick ? "Sem autenticação" : await ctx.ui.select("Autenticação", ["Sem autenticação", "Variável de ambiente"]);
          if (!auth) return;
          let envName: string | undefined;
          if (auth === "Variável de ambiente") {
            envName = await input("Nome da variável de ambiente (não a chave)", v => /^[A-Za-z_][A-Za-z0-9_]*$/.test(v), "Informe um nome de variável válido, não a chave.");
            if (!envName) return;
          }
          const config: ProviderConfig = { baseUrl: url, api, ...(envName ? { apiKey: envName, authHeader: true } : { auth: "none" }) };
          if (action === "Cadastrar e buscar modelos" || quick) {
            ctx.ui.notify("Consultando modelos do endpoint...", "info");
            const result = await discoverModels(config);
            config.models = result.models;
            file.providers[provider] = config;
            const fallback = result.fallback ? `\n${result.fallback} modelo(s) sem contexto informado usam 128000 tokens; saída padrão até 8192.` : "\nLimite de saída padrão: até 8192 tokens quando não informado.";
            if (await saveConfig(file, ctx, `Cadastrar ${provider}: ${result.models.length} modelos de ${url}.\n${result.models.map(m => m.id).join("\n")}${fallback}`)) ctx.ui.notify("Modelos salvos. Reinicie o OMP para carregá-los.", "info");
          } else {
            const model = await input("ID exato do modelo", v => v.length > 0 && !/[\r\n]/.test(v), "Informe o ID exato do modelo.");
            if (!model) return;
            const context = await input("Janela de contexto em tokens", v => /^\d+$/.test(v) && !!positiveInteger(Number(v)), "Informe um inteiro positivo.");
            if (!context) return;
            const output = await input("Máximo de tokens de saída", v => /^\d+$/.test(v) && !!positiveInteger(Number(v)) && Number(v) <= Number(context), "Informe um inteiro positivo até o limite de contexto.");
            if (!output) return;
            config.models = [{ id: model, contextWindow: Number(context), maxTokens: Number(output) }];
            file.providers[provider] = config;
            const warning = envName && !process.env[envName] ? `\nDefina ${envName} antes de usar o modelo.` : "";
            if (await saveConfig(file, ctx, `Cadastrar ${provider}/${model} em ${url}.${warning}`)) ctx.ui.notify("Modelo salvo. Reinicie o OMP para carregá-lo.", "info");
          }
          return;
        }
        const names = Object.keys(file.providers);
        if (!names.length) throw new Error("Não há provedores cadastrados no arquivo de modelos.");
        provider = await ctx.ui.select("Selecione o provedor", names);
        if (!provider) return;
        const config = file.providers[provider];
        if (!config || typeof config !== "object" || Array.isArray(config)) throw new Error("Configuração de provedor inválida.");
        if (action === "Atualizar modelos") {
          ctx.ui.notify("Consultando modelos do endpoint...", "info");
          const result = await discoverModels(config);
          const old = Array.isArray(config.models) ? config.models : [];
          const oldIds = new Set(old.map(m => m.id));
          const newIds = new Set(result.models.map(m => m.id));
          const added = result.models.filter(m => !oldIds.has(m.id)).map(m => m.id);
          const removed = old.filter(m => !newIds.has(m.id)).map(m => m.id);
          config.models = result.models;
          const summary = `Atualizar ${provider}: ${result.models.length} modelos.\nAdicionados: ${added.join(", ") || "nenhum"}\nRemovidos: ${removed.join(", ") || "nenhum"}\n${result.fallback} sem contexto informado usam 128000; saída padrão até 8192.`;
          if (await saveConfig(file, ctx, summary)) ctx.ui.notify("Modelos atualizados. Reinicie o OMP para carregá-los.", "info");
        } else if (action === "Renomear provedor") {
          const newName = await input("Novo ID do provedor (ex.: lm-1235)", v => /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(v), "Use letras, números, hífen ou underscore.");
          if (!newName) return;
          if (Object.hasOwn(file.providers, newName)) throw new Error(`O provedor '${newName}' já existe; nenhuma configuração foi alterada.`);
          if (newName === "local" || newName === "web" || (newName !== "lm-studio" && ctx.modelRegistry.hasProvider(newName))) throw new Error(`O ID '${newName}' já é usado pelo OMP. Escolha outro nome.`);
          file.providers[newName] = config;
          delete file.providers[provider];
          if (await saveConfig(file, ctx, `Renomear ${provider} para ${newName}?\nSeletores que usam ${provider}/ em outras configurações não serão atualizados.`)) ctx.ui.notify(`Provedor renomeado para ${newName}. Reinicie o OMP e selecione o modelo novamente.`, "info");
        } else if (action === "Excluir modelo ou provedor") {
          const choice = await ctx.ui.select("O que excluir?", ["Modelo", "Provedor inteiro"]);
          if (!choice) return;
          if (choice === "Provedor inteiro") {
            delete file.providers[provider];
            if (await saveConfig(file, ctx, `Excluir o provedor ${provider} e todos os seus modelos?`)) ctx.ui.notify("Provedor excluído da configuração. Reinicie o OMP.", "info");
          } else {
            if (!Array.isArray(config.models) || config.models.length === 0) throw new Error("Este provedor não possui modelos cadastrados no arquivo.");
            const model = await ctx.ui.select("Selecione o modelo", config.models.map(m => m.id));
            if (!model) return;
            config.models = config.models.filter(m => m.id !== model);
            if (await saveConfig(file, ctx, `Excluir ${provider}/${model}? Uma atualização pode cadastrá-lo novamente se o endpoint ainda o listar.`)) ctx.ui.notify("Modelo excluído da configuração. Reinicie o OMP.", "info");
          }
        }
      } catch (error) {
        ctx.ui.notify(`Operação não concluída: ${error instanceof Error ? error.message : String(error)}`, "error");
      }
    },
  });
}
