# code-agent

Skills de agents e extensões (plugins) do omp.

## Instalação

Abra o destino com `Win + R` e copie:

| Origem | Destino |
| --- | --- |
| Pastas de `skills/` | `%USERPROFILE%\.agents\skills\` |
| Arquivos de `omp-extensions/*.ts` | `%USERPROFILE%\.omp\agent\extensions\` |

Reinicie o omp após instalar extensões.

`turn-time.ts`: exibe duração e tokens no rodapé ao fim do turno, sem alterar ou reconstruir o histórico.

## writing-for-agents

Regras-base para enviar ao agent com a skill `writing-for-agents`:

```text
- Escreva código e comentários em inglês; responda ao usuário em pt-BR.
- Faça commit apenas a pedido do usuário ou por instrução explícita de uma skill invocada manualmente.
- Use Conventional Commits com a descrição em pt-BR.
- Flexione conforme a quantidade: `1 classe`, `2 classes`, em vez de `classe(s)`.
- Preserve a qualidade da validação com a menor interferência no usuário: prefira verificações sem controle do desktop e use a interface quando ela for necessária para comprovar o comportamento.
- Ao usar o desktop, prefira interação em segundo plano, reúna ações previsíveis em sessões curtas e libere o controle assim que concluir a verificação. Tome foco, mouse ou teclado apenas pelo tempo indispensável.
- Em sessões no omp, use o computer use do próprio omp para interagir com o desktop. Se estiver desativado ou indisponível, avise uma vez e continue pelas verificações disponíveis sem substituí-lo por outro mecanismo de controle do desktop; informe qualquer validação de interface pendente.
- Fora do omp, use as ferramentas disponíveis no ambiente, mantendo a mesma política de mínima interferência, sem exigir nem alertar sobre a ausência do computer use do omp.
- Em sessões no omp, o uso necessário do computer use já está autorizado: use-o sem pedir permissão ao usuário, mantendo a mínima interferência definida acima.
```