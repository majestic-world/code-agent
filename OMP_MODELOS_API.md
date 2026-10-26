# Adicionar modelo OpenAI-compatible ao OMP

Use este procedimento quando o provedor não tiver suporte nativo no OMP.

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
