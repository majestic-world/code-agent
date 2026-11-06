# Tickets internos à implementação

Leia esta referência quando for necessário decompor o trabalho ou quando a entrada já tiver tickets. A fonte continua sendo o plano/spec e suas decisões, não uma lista de tarefas desconectada do resultado desejado.

## Prepare o grafo antes do código

Inventarie tickets existentes, inclusive concluídos, e compare sua cobertura com todos os critérios de aceite. Reutilize IDs e status respaldados por evidências. Crie somente os tickets ausentes e corrija dependências inválidas antes de implementar. Um ciclo ou uma referência a um bloqueador inexistente precisa ser resolvido, não ignorado para liberar trabalho.

Cada ticket deve ser uma fatia vertical **tracer bullet**: um caminho estreito e completo pelas camadas necessárias, demoável ou verificável sozinho, dimensionado para um contexto. Expresse o comportamento entregue, critérios de aceite e os tickets que realmente precisam terminar antes dele. Use o vocabulário do glossário e respeite ADRs. Prefatorações necessárias vêm primeiro e devem explicar qual dependência desbloqueiam.

Não transforme cada camada técnica em um ticket. Para mudanças mecânicas de grande alcance, use **expand–contract**: introduza a forma nova junto da antiga, migre consumidores em lotes verificáveis e só remova a antiga após todas as migrações. Cada lote deve manter o projeto válido. Se a linguagem ou o contrato exigirem uma troca atômica, agrupe a menor unidade que pode ser validada e commitada inteira, com investigação antecipada e checkpoints de contexto; não crie uma branch de integração nem declare lotes quebrados como concluídos.

Confira a cobertura total da fonte e a ordem topológica do grafo. Registre a decomposição e inicie a execução, sem solicitar aprovação rotineira da granularidade. Uma mudança material de escopo descoberta durante a decomposição exige resolver essa decisão antes do trabalho dependente.

## Persistência e status

Siga o tracker do projeto. Sem configuração, use **um arquivo por ticket** em `.scratch/<feature>/issues/<NN>-<slug>.md`, numerados em ordem de dependência. Preserve as convenções de tickets existentes e use os rótulos configurados quando houver. Para tickets novos sem vocabulário definido, use `ready-for-agent`, `in-progress`, `implemented`, `done` e `blocked`.

```markdown
# 01: Título da entrega

**Fonte:** referência ao plano/spec e aos critérios cobertos.

**O que entregar:** comportamento de ponta a ponta, da perspectiva do usuário.

**Bloqueado por:** IDs/títulos dos bloqueadores, ou Nenhum.

**Status:** ready-for-agent

## Critérios de aceite
- [ ] Resultado observável

## Evidências de implementação
Commits, verificações executadas e resultados; preencher durante a execução.
```

Descrições de tickets registram responsabilidades e contratos; evite inventários de caminhos que envelhecem rapidamente. Preserve trechos de protótipo apenas quando codificarem uma decisão com mais precisão que a prosa. Ponteiros para fontes, commits e evidências pertencem ao registro de execução.

Se houver autorização para publicar em um tracker remoto, crie em ordem de dependência e use relações nativas quando disponíveis; caso contrário, referencie IDs reais na descrição. Vincule ao pai conforme as convenções existentes, sem encerrá-lo. Configuração de tracker não é, isoladamente, autorização de publicação: se ela faltar, prepare os tickets locais e prossiga com a implementação autorizada, deixando a sincronização remota explicitamente pendente. Não duplique tickets na retomada.

`implemented` libera os dependentes quando os critérios e testes da etapa passaram e o commit foi registrado. `done` exige também os gates integrados e a revisão final descritos em `SKILL.md`. Se uma correção invalidar uma etapa, reavalie seus dependentes antes de avançar ou encerrar.
