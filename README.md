# code-agent

Skills de agents e extensões (plugins) do omp.

## Instalação

Abra o destino com `Win + R` e copie:

| Origem | Destino |
| --- | --- |
| Pastas de `skills/` | `%USERPROFILE%\.agents\skills\` |
| Arquivos de `omp-extensions/*.ts` | `%USERPROFILE%\.omp\agent\extensions\` |

Reinicie o omp após instalar extensões.

## writing-for-agents

Regras-base para enviar ao agent com a skill `writing-for-agents`:

```text
- Escreva código e comentários em inglês; responda ao usuário em pt-BR.
- Faça commit apenas a pedido do usuário ou por instrução explícita de uma skill invocada manualmente.
- Use Conventional Commits com a descrição em pt-BR.
- Flexione conforme a quantidade: `1 classe`, `2 classes`, em vez de `classe(s)`.
```