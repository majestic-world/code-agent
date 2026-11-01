# Adicionar modelo OpenAI-compatible ao OMP

Use este procedimento quando o provedor não tiver suporte nativo no OMP.

## Assistente no OMP

1. Copie `omp-extensions/endpoint.ts` para `%USERPROFILE%\.omp\agent\extensions\` (ou `~/.omp/agent/extensions/`) e reinicie o OMP.
2. Execute `/endpoint` e escolha **Conectar LM Studio (sem chave)**. Informe a URL base, por exemplo `http://localhost:1235/v1`.
3. Confira a lista encontrada e confirme o cadastro. Reinicie o OMP e selecione o modelo com `/model`.

O nome gerado é `lm-studio`. Para renomear um cadastro anterior, use `/endpoint` → **Renomear provedor**, escolha o provedor e informe `lm-studio`. Reinicie o OMP e selecione o modelo novamente; seletores em outras configurações não são renomeados automaticamente.

`lm-studio` também é um provedor nativo do OMP: a descoberta nativa pode adicionar modelos à lista, inclusive embeddings, e fazer um modelo excluído reaparecer mesmo sem atualizar pela extensão.

O menu também permite cadastrar outros endpoints OpenAI-compatible com descoberta automática ou inserir um modelo manualmente. Para endpoints autenticados, informe **o nome da variável de ambiente**, não a chave; a descoberta exige que a variável já esteja definida no processo do OMP.

Para atualizar, execute `/endpoint` → **Atualizar modelos** e escolha o provedor. O resumo mostra modelos adicionados e removidos antes de confirmar. Para remover, escolha **Excluir modelo ou provedor**. Um modelo excluído voltará a ser cadastrado na próxima atualização se o servidor ainda o listar; excluir o provedor não remove os arquivos de modelo do LM Studio.

O assistente consulta `/models` e, quando disponível, os metadados nativos do LM Studio. Modelos que o LM Studio identifica como embeddings são ignorados. A lista e os tipos dependem do que o servidor informa. Quando o contexto não é informado, usa 128000 tokens; quando a saída não é informada, usa até 8192. Confira esses limites, especialmente para modelos desconhecidos.

O assistente usa o diretório do perfil ativo e mantém os outros provedores. Se já existir um provedor com o mesmo ID, não o substitui. Ao editar YAML existente, ele reformata o arquivo e remove comentários, mediante confirmação. Reinicie o OMP após cada alteração para carregar a configuração. Se uma variável de ambiente não estiver definida, o OMP pode enviar seu nome literal como chave; defina-a antes de usar o modelo.

## Configuração manual

## 1. Crie `models.yml`

Arquivo global:

```text
~/.omp/agent/models.yml
```

No Windows:

```text
C:\Users\SEU_USUARIO\.omp\agent\models.yml
```

## 2. Configure o provedor

```yaml
providers:
  meu-provedor:
    baseUrl: https://api.exemplo.com/v1
    api: openai-completions
    apiKey: MEU_PROVEDOR_API_KEY
    authHeader: true
    models:
      - id: modelo-exato-da-api
        name: Meu modelo
        contextWindow: 128000
        maxTokens: 8192
```

Regras:

- `baseUrl`: URL base, sem `/chat/completions`;
- `api`: use `openai-completions` para Chat Completions;
- use `openai-responses` somente se o provedor implementar `/responses`;
- `id`: identificador exato enviado à API;
- `contextWindow` e `maxTokens`: limites publicados pelo provedor.

Se o arquivo já existir, adicione o provedor dentro do bloco `providers:` existente.

## 3. Configure a chave

PowerShell, apenas no terminal atual:

```powershell
$env:MEU_PROVEDOR_API_KEY = "sk-sua-chave"
```

Ou crie `~/.omp/agent/.env`:

```dotenv
MEU_PROVEDOR_API_KEY=sk-sua-chave
```

Não grave a chave diretamente no `models.yml`.

## 4. Teste

```powershell
omp models find meu-provedor
omp -p --model meu-provedor/modelo-exato-da-api "Responda somente: conexão funcionando"
```

Para uma sessão interativa:

```powershell
omp --model meu-provedor/modelo-exato-da-api
```

## API sem autenticação

Para servidor local sem chave, substitua `apiKey` e `authHeader` por:

```yaml
auth: none
```

## Erros comuns

| Erro | Verifique |
|---|---|
| Modelo não aparece | YAML, variável de ambiente e ID do provedor |
| `401` ou `403` | Chave, permissões e `authHeader` |
| `404` | `baseUrl`, ID do modelo e tipo de API |
| Erro no campo `strict` | Adicione `disableStrictTools: true` ao provedor |

Configuração mínima final:

```yaml
providers:
  provedor:
    baseUrl: https://host/v1
    api: openai-completions
    apiKey: PROVEDOR_API_KEY
    authHeader: true
    models:
      - id: modelo
        contextWindow: 128000
        maxTokens: 8192
```
