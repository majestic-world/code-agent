---
name: create-plan
description: "Planeja qualquer iniciativa a partir do pedido do usuário: criação do zero, novas implementações, melhorias, correções ou outras entregas, investiga o contexto e entrega na conversa um plano robusto para to-spec, com perguntas apenas quando indispensáveis. Uso exclusivamente manual."
---

# Create Plan

Ative somente por pedido explícito do usuário, como `/create-plan` ou `$create-plan`. Transforme o pedido em um plano fundamentado, mantido na conversa para o usuário seguir com `to-spec`. Planejamento é o entregável: não implemente, publique issues ou invoque a próxima skill automaticamente.

## Investigue antes de perguntar

Extraia do pedido e do histórico os objetivos, entregas desejadas, restrições e decisões já tomadas. Preserve todos os itens solicitados, inclusive quando houver várias frentes independentes.

Adapte a investigação ao ponto de partida. Para criação do zero, defina a estrutura e os componentes necessários a partir dos objetivos e restrições; a ausência de código existente é esperada e não é um bloqueio. Para trabalho em algo existente, investigue sua estrutura antes de propor a abordagem. Investigue o contexto disponível, quando houver: instruções do projeto, documentação, glossário, ADRs, código dos fluxos afetados, contratos, dependências e testes relacionados. Siga os padrões existentes quando forem adequados. Busque informações técnicas verificáveis nas fontes disponíveis em vez de pedir ao usuário que as pesquise. Limite a investigação às áreas que podem mudar o plano.

Separe fatos verificados, decisões do usuário e recomendações ou premissas suas. Se o pedido depender de um projeto existente ao qual não houver acesso, elabore o que for possível a partir do pedido e explicite as verificações pendentes; peça sua localização apenas se ela for necessária para decidir a abordagem. Não apresente módulos, arquivos ou comportamentos não inspecionados como fatos.

## Pergunte somente quando a resposta muda o plano

O resultado esperado é frequentemente **zero perguntas**. Para cada dúvida, avalie:

1. A resposta já está no pedido, no histórico ou pode ser descoberta pela investigação?
2. Existe uma escolha razoável, alinhada aos objetivos e de baixo custo de reversão, que você pode recomendar e registrar como premissa?
3. Se nenhuma das anteriores resolve, respostas diferentes mudariam materialmente o escopo, o comportamento esperado, um contrato externo, uma migração arriscada ou a arquitetura com alto custo de reversão?

Pergunte apenas no terceiro caso ou quando faltar o próprio objetivo necessário para planejar. Escolha detalhes técnicos rotineiros por conta própria. Evite entrevistas sobre preferências opcionais, cenários hipotéticos e decisões já respondidas. Explique brevemente qual decisão depende da resposta.

Use a ferramenta de perguntas com opções selecionáveis disponível no modo atual, respeitando suas restrições. Prefira `request_user_input_async` quando disponível; use `request_user_input` somente nos modos e casos permitidos. Ofereça 2–3 alternativas concretas, com a recomendada primeiro e marcada **(Recomendado)**, e uma breve justificativa ou consequência. Garanta a alternativa de resposta livre **Other / Outro**: quando a interface já a fornece, use essa opção nativa sem duplicá-la; caso contrário, acrescente-a. Se nenhuma ferramenta compatível estiver disponível, apresente alternativas numeradas na conversa, incluindo **Outro — descreva**.

Agrupe apenas perguntas independentes realmente indispensáveis. Continue a investigação que não depende das respostas enquanto espera. Uma recomendação ou opção pré-selecionada não equivale à decisão do usuário. Se a resposta for indispensável, mantenha a decisão pendente; não interprete silêncio como aprovação. Faça nova rodada apenas se a resposta revelar outro bloqueio real.

## Construa o plano

Dimensione o detalhe ao escopo e à complexidade do pedido. O plano deve permitir que `to-spec` sintetize uma especificação sem reconstruir o raciocínio. Cubra os elementos aplicáveis, agrupando-os de forma legível:

- **Objetivo e resultado esperado:** necessidade ou oportunidade, beneficiários e comportamento desejado, com exemplos concretos quando úteis.
- **Escopo:** cada entrega solicitada, limites acordados e exclusões relevantes para impedir expansão acidental.
- **Contexto e ponto de partida:** descobertas que sustentam a abordagem, recursos existentes e evidências consultadas. Em iniciativas novas, descreva o que precisa ser criado e as premissas iniciais. Mantenha caminhos de arquivos nas evidências; expresse decisões em termos de responsabilidades e contratos.
- **Solução recomendada:** decisões técnicas e funcionais, interfaces, dados, estados, integrações e casos de erro relevantes. Explique alternativas apenas quando houver um trade-off material.
- **Sequência de execução:** etapas executáveis, dependências e resultado verificável de cada etapa; inclua migração, compatibilidade e reversão somente quando necessárias.
- **Critérios de aceite:** condições observáveis cobrindo cada resultado solicitado, prontas para orientar histórias de usuário e validação.
- **Estratégia de testes:** comportamentos a validar, limites de integração onde testá-los e exemplos existentes no projeto, quando disponíveis. Prefira interfaces públicas e reutilize pontos de teste existentes quando adequados; em novas implementações, proponha os limites de teste necessários. Identifique propostas como recomendações, sem alegar aprovação do usuário.
- **Riscos, premissas e pendências:** apenas os que podem afetar a entrega. Diferencie verificações futuras de decisões que ainda bloqueiam o plano.

Antes de entregar, confira que todo item solicitado aparece na solução e nos critérios de aceite, que a ordem respeita as dependências e que fatos e premissas estão distinguíveis. Não acrescente refatorações, infraestrutura ou funcionalidades sem relação necessária com o objetivo.

## Entregue na conversa

Publique o plano completo na resposta, no idioma do usuário, preservando decisões e respostas para a próxima etapa. Não substitua o conteúdo por um link e não crie arquivos de plano por padrão; salve-os somente se solicitado.

Se não houver decisão bloqueante, indique que o plano está pronto para o usuário chamar `/to-spec`, sem exigir uma rodada genérica de aprovação. Caso ainda exista um bloqueio, entregue a parte consolidada e destaque exatamente a decisão pendente, sem declarar o plano pronto. A próxima skill mantém seu próprio fluxo; este plano não equivale à aprovação de ações ou recomendações ainda não aprovadas.
