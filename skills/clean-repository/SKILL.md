---
name: clean-repository
description: "Limpa a .scratch após ler seu conteúdo, preservar conhecimento duradouro na documentação do projeto e debater a seleção com um subagente. Use para pedidos de limpeza dessa pasta ou de seus specs e tickets locais; não para limpeza genérica de código, builds ou dependências."
---

# Clean Repository

Transforme conhecimento temporário realmente útil em documentação mantida e, depois de uma revisão independente, remova a `.scratch` do projeto. O resultado pode ser nenhuma alteração em documentação quando ela já cobre tudo que importa. Nunca crie commit nem prepare staging.

## 1. Delimite a limpeza

Confirme a raiz do projeto, leia o `AGENTS.md` aplicável e siga os documentos que ele indicar sobre organização de documentação, domínio, ADRs e rastreador local. Registre o estado Git para distinguir alterações preexistentes das suas; fora de um repositório Git, registre o estado inicial por inventário e hashes e use essa comparação na verificação final.

O alvo é somente a `.scratch` da raiz desse projeto. Descoberta automática da skill não autoriza exclusão: prossiga com a remoção quando o usuário tiver pedido a limpeza; criar, explicar ou revisar esta skill não é executar a limpeza.

Comece por uma enumeração controlada: examine cada diretório antes de descer, identificando links simbólicos, junctions, worktrees e repositórios aninhados. Não siga links para completar a leitura nem trate um checkout com trabalho único como descarte documental. Complete assim o inventário, incluindo arquivos ocultos e ignorados. Se houver trabalho ativo que seria perdido, preserve a pasta e resolva especificamente esse impedimento com o usuário; não crie commits para contorná-lo. Se a pasta não existir, informe isso e encerre sem criar documentação por obrigação.

## 2. Leia e decida o que merece sobreviver

Leia integralmente todos os arquivos textuais, em lotes quando necessário. Inventário, busca por palavras, títulos e status não substituem a leitura; retome saídas truncadas até cobrir o arquivo. Ler uma spec ou um ticket não autoriza implementá-lo. Inspecione os demais formatos com ferramentas adequadas e explique o papel de artefatos gerados. Um conteúdo que não pôde ser avaliado impede declarar a leitura concluída e excluir a pasta inteira.

Compare as informações com a documentação atual e, onde a decisão depender disso, com código e testes. Distinga comportamento implementado, decisão aceita, proposta e informação superada; um ticket aberto pode já estar implementado e uma spec não prova que uma funcionalidade exista.

Preserve somente informação cuja perda prejudicaria a manutenção: decisões e seus motivos não evidentes, invariantes, contratos, restrições ainda válidas e procedimentos operacionais necessários. Considere também compromissos pendentes relevantes que não possam ser recuperados em outro lugar, identificando-os como pendentes, nunca como funcionalidades entregues. Se a única cópia de trabalho importante não couber legitimamente na documentação, resolva seu destino antes de apagá-la.

Descarte duplicatas, planos superados, propostas não adotadas, diários de execução, logs transitórios e detalhes recuperáveis diretamente do código sem valor explicativo adicional. Não copie segredos, dumps de dados ou credenciais para a documentação. Não arquive toda a `.scratch` sob outro nome nem crie um documento para cada spec ou ticket.

Forme uma seleção curta para revisão: grupos de fontes lidas, conhecimento a preservar, destino proposto e motivo para descartar o restante. Mantenha esse registro na conversa ou em um local temporário fora da `.scratch`, sem criar um catálogo permanente de descarte.

## 3. Debata a seleção com um subagente

Depois de formar sua própria decisão, chame obrigatoriamente um subagente para avaliar omissões e excesso de documentação. Forneça a raiz, as instruções aplicáveis, o inventário completo e sua seleção com justificativas; dê acesso às fontes e à documentação, não apenas ao seu resumo.

Peça que examine também o material proposto para descarte, procure conhecimento importante perdido, confira se propostas foram confundidas com fatos e questione documentos redundantes ou sem utilidade duradoura. A revisão deve ser somente leitura e apontar evidências e destinos, sem apagar arquivos ou criar documentação em paralelo.

Debata os achados, releia as fontes contestadas e ajuste a decisão com base nas evidências. Não aceite automaticamente nem ignore a opinião do subagente. Resolva divergências materiais antes da exclusão; se faltar uma decisão do usuário para proteger informação importante, apresente apenas esse ponto. Sem subagente disponível, mantenha a pasta e informe que a revisão obrigatória ficou pendente.

## 4. Consolide a documentação

Atualize primeiro documentos existentes, no local recomendado pelo `AGENTS.md`. Use `docs/` para o conhecimento mantido ali e respeite destinos específicos do projeto, como ADRs ou um documento de contexto na raiz. Crie um documento apenas para uma responsabilidade duradoura que ainda não tenha lugar adequado. Preserve o idioma e o estilo existentes.

Sintetize o resultado atual e os motivos necessários para entendê-lo, sem copiar o histórico da execução. Não promova propostas a fatos nem altere decisões arquiteturais silenciosamente. Troque referências concretas aos arquivos que serão removidos por explicações autossuficientes ou links mantidos; referências genéricas à convenção `.scratch/` podem continuar válidas.

Confirme que cada item selecionado ficou coberto e que nenhuma alteração alheia foi sobrescrita. Peça ao mesmo subagente que confira as alterações finais e se ainda há algo importante nas fontes sem destino. A exclusão depende dessa conferência, inclusive quando a decisão final for não acrescentar documentação.

## 5. Remova somente depois de concluir a preservação

Confira novamente o inventário e o conteúdo contra o que foi lido, usando metadados e hashes quando necessário. Se houve alteração ou entrada nova, avalie o novo material e revise a decisão afetada antes de apagar. Se algum processo ainda escreve na pasta, resolva essa concorrência primeiro.

Verifique o caminho absoluto final: ele deve ser exatamente a `.scratch` da raiz confirmada, sem redirecionamentos por links. Remova apenas esse diretório com a ferramenta nativa apropriada. No Windows, use uma única operação PowerShell com `-LiteralPath` após verificar o alvo; não monte comandos de exclusão em outro shell nem use `git clean` ou `reset` para a limpeza.

Verifique que a pasta foi removida, que os documentos mantidos não têm links concretos quebrados para ela e que o diff contém somente a consolidação e a exclusão esperadas, preservando alterações preexistentes. Não modifique código, faça staging ou crie commit. A autorização já dada para limpar é suficiente para a exclusão revisada; não acrescente uma confirmação genérica ao final.

## Entrega

Informe brevemente o que foi preservado e onde, que a revisão do subagente foi concluída e que a `.scratch` foi removida sem commit. Se houver impedimento, identifique o conteúdo ou a decisão pendente e diga claramente que a pasta foi preservada. Não declare limpeza concluída enquanto houver material sem avaliação ou preservação necessária por resolver.
