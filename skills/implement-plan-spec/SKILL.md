---
name: implement-plan-spec
description: "Implementa um plano ou spec até a conclusão na branch atual, criando tickets quando necessário, com TDD, commits por etapa e revisão de código. Use para executar ou retomar trabalho já definido, inclusive após create-plan e to-spec."
---

# Implement Plan Spec

Execute o plano, spec ou conjunto de tickets fornecido até cumprir todos os critérios de aceite. Esta é a entrada única de implementação: decida internamente se o escopo precisa de tickets e crie-os antes de implementar. O usuário não precisa escolher entre `implement`, `implement-spec` e `to-tickets`.

## 1. Fixe o contexto e a base

Leia a fonte completa, inclusive comentários relevantes quando for uma issue, e as instruções do repositório, glossário, ADRs e código afetado. Use as decisões mais recentes do usuário para resolver divergências; esclareça somente ambiguidades que mudem materialmente o resultado ou bloqueiem execução segura. Um plano suficientemente definido pode ser executado diretamente, sem exigir conversão para spec.

Registre o diretório de trabalho, a branch atual, o SHA inicial (`base_sha`), o estado do índice e as alterações preexistentes. `base_sha` é a base fixa da revisão final, não o HEAD que avança a cada etapa. Em retomadas, recupere a base original antes de definir uma nova.

**Trabalhe no checkout e na branch atuais durante toda a execução. Não crie worktrees, branches auxiliares ou branch de integração; não troque de branch.** Se HEAD estiver detached, não houver repositório ou a branch mudar externamente, resolva esse impedimento com o usuário antes de modificar código ou criar commits. Não faça reset, stash ou limpeza para obter uma árvore limpa. Preserve alterações preexistentes; se estiverem entrelaçadas com a implementação, esclareça sua autoria e escopo antes de incluí-las em commits.

Localize as convenções de tracker e testes nas instruções do projeto. Sem tracker configurado, use tickets Markdown locais em `.scratch/<feature>/issues/`, conforme a preferência deste fluxo; isso não exige executar uma skill de setup.

## 2. Escolha a granularidade e prepare a execução

- **Entrega coesa e pequena:** execute diretamente, com checklist dos critérios de aceite. Não crie tickets artificiais.
- **Múltiplas entregas verificáveis, dependências ou vários contextos:** leia [references/tickets.md](references/tickets.md) e prepare o grafo de tickets antes de iniciar a implementação.
- **Tickets existentes:** leia a mesma referência, reutilize-os e complete apenas lacunas reais; não recrie trabalho concluído.

Apresente brevemente a sequência e os resultados verificáveis e prossiga. Uma decomposição técnica dentro do escopo autorizado não exige nova aprovação genérica. Pergunte apenas se ela revelar uma decisão de produto, escopo ou risco ainda não resolvida.

Para trabalho com tickets ou que precise sobreviver a vários contextos, mantenha `.scratch/<feature>/execution.md` (ou o registro equivalente já existente), com ponteiros para a fonte, branch, `base_sha`, alterações preexistentes, dependências, status, decisões de teste já confirmadas, commits, evidências de validação e próximo passo. Se o plano existir só no chat, preserve ali seus requisitos e decisões necessários à retomada. Respeite as regras do projeto para versionar ou ignorar esses artefatos; nunca force sua inclusão quando ignorados.

## 3. Execute e faça commits incrementais

Execute a **fronteira**: um ticket está disponível quando todos os seus bloqueadores estão concluídos. Implemente um ticket por vez no checkout compartilhado. Atualize o registro ao concluir cada etapa e continue automaticamente enquanto houver trabalho autorizado e executável; tickets não são pontos de parada para pedir confirmação.

Use subagentes para investigação e revisão independentes quando disponíveis e permitidos. Dê-lhes ponteiros para os artefatos e commits, com acesso somente de leitura ao código e índice. Apenas o agente responsável pela implementação edita código e faz commits. Isso permite paralelismo de análise sem disputas pelo mesmo checkout. Se delegação estiver indisponível, realize as mesmas verificações no agente principal e informe essa limitação.

Para cada etapa:

1. Relacione os critérios de aceite ao comportamento observável e às interfaces públicas de teste. Leia e aplique a skill instalada `tdd`, incluindo suas referências pertinentes. Reutilize as interfaces de teste já confirmadas na spec ou na conversa; não peça confirmação novamente. Se faltar a confirmação exigida pela `tdd`, apresente as interfaces propostas e obtenha somente essa decisão antes de escrever testes. Se a skill não estiver listada, procure seu `SKILL.md` nos diretórios de skills instaladas; se ausente, informe a dependência antes de iniciar o ciclo.
2. Faça ciclos verticais: um teste que falha pelo motivo esperado, a implementação mínima que o faz passar, depois o próximo comportamento. Teste contratos públicos, com resultados esperados independentes da implementação. Para alterações sem comportamento executável, como documentação, use a validação apropriada em vez de fabricar testes. Faça prefatorações necessárias como etapas explícitas, verificadas, preservando comportamento.
3. Execute os testes afetados e a checagem de tipos regularmente, além das verificações exigidas pelo repositório. Corrija regressões da etapa antes de avançar. Diferencie falhas preexistentes ou do ambiente de falhas introduzidas; registre evidências e não declare verificações não executadas como aprovadas.
4. Revise o diff, selecione somente arquivos ou hunks desta etapa e inspecione o diff do índice antes do commit. Preserve conteúdo de terceiros já staged; se não for possível isolá-lo com segurança, esclareça antes de commitar. Faça um commit local por etapa coerente e validada, seguindo a convenção do projeto e referenciando o ticket quando houver. Não use staging global indiscriminado nem reescreva commits anteriores.
5. Registre o SHA e a evidência de aceite. Marque o ticket como implementado localmente; o encerramento definitivo depende da validação integrada e da revisão final. Recalcule a fronteira e siga para a próxima etapa.

Ao retomar, confronte registro, histórico Git, tickets e código: um rótulo de concluído sem evidência não basta, e um commit já aplicado não deve ser repetido. Se um ticket bloquear, continue os independentes quando possível e apresente o impedimento preciso; não declare a spec concluída com pendências.

## 4. Valide o conjunto e revise a entrega

Quando todas as etapas estiverem implementadas, execute a suíte completa aplicável e as checagens exigidas (tipos, lint, build e integração conforme o projeto). Confira cada critério de aceite da fonte contra o código e as evidências, incluindo interações entre tickets.

Leia e execute a skill instalada `code-review`, fornecendo explicitamente `base_sha`, a fonte do plano/spec e as convenções do tracker. Localize-a nos diretórios instalados se necessário. Preserve seus dois eixos, **Standards** e **Spec**, com revisores independentes somente de leitura quando disponíveis. Use o intervalo completo desde a base inicial, incluindo todos os commits desta execução. Se a revisão não puder executar, informe a limitação e não declare que esse gate passou.

Avalie os achados, corrija problemas pertinentes ao escopo e às normas do projeto, registre a justificativa de qualquer achado descartado e faça novos commits. Reexecute os testes afetados pelas correções e os gates integrados que elas invalidarem; revise os trechos corrigidos e seus efeitos até não restarem achados acionáveis não resolvidos. Evite ampliar a entrega com refatorações sem relação com o pedido.

## 5. Conclua com evidências

Encerre tickets locais somente depois de aceite, validação integrada e revisão satisfatórios. Para trackers remotos, siga a convenção configurada e a autorização vigente. Uma implementação local não equivale a uma issue resolvida quando o tracker exige merge de PR; nesse caso, registre a implementação e a pendência de integração. Não feche a issue-pai apenas por encerrar filhos.

Esta execução autoriza os commits locais previstos; push, abertura ou publicação de PR, merge e deploy seguem as autorizações próprias dessas ações. Não crie um PR ou publique tickets remotos apenas por herdar o comportamento da antiga `implement-spec`.

Informe resultado entregue, branch, commits, tickets criados/concluídos quando houver, validações e resultado separado dos dois eixos da revisão. Identifique limitações ou pendências concretas. Só declare conclusão integral quando todos os critérios de aceite e gates aplicáveis estiverem satisfeitos.
