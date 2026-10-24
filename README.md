# code-agent

Skills de agents e extensões (plugins) do omp.

- `skills/`: skills de agents.
- `omp-extensions/`: extensões do omp.

## Instalando as skills

1. Pressione `Win + R` para abrir **Executar**, cole `%USERPROFILE%\.agents\skills` e pressione `Enter`.
2. Copie a pasta de cada skill de `skills/` para esse destino, mantendo o arquivo `SKILL.md` e os demais arquivos dentro da pasta da skill.

Exemplo: `skills/create-plan/` deve ficar em `%USERPROFILE%\.agents\skills\create-plan\`.

## Instalando as extensões (plugins)

1. Pressione `Win + R` para abrir **Executar**, cole `%USERPROFILE%\.omp\agent\extensions` e pressione `Enter`.
2. Copie os arquivos `.ts` de `omp-extensions/` para esse destino.
3. Reinicie o omp.

Exemplo: `omp-extensions/turn-time.ts` deve ficar em `%USERPROFILE%\.omp\agent\extensions\turn-time.ts`.

> `%USERPROFILE%` aponta para a pasta do seu usuário, como `C:\Users\SeuNome`. Se uma pasta de destino ainda não existir, crie-a antes de copiar os arquivos.
