# Elephant-Goldfish Model no OMP

O [EGM](https://github.com/google/elephant-goldfish-model) ajuda a definir e revisar um app ou uma feature antes da implementação. O agente principal desenvolve a proposta; subagentes com contexto novo revisam pontos cegos e riscos.

## Instalação

No terminal, execute:

```powershell
omp plugin marketplace add google/elephant-goldfish-model
omp plugin install egm@egm
```

Inicie uma nova sessão do OMP após a instalação. Instale o plugin completo: copiar apenas `skills/` não inclui os agentes e documentos necessários.

## Criar um app ou uma feature

Abra o OMP na pasta do projeto. Para um app novo, use uma pasta vazia. Para uma feature, use a pasta do projeto existente.

1. **Explore a ideia.** Descreva o objetivo, o público, as funcionalidades e as restrições conhecidas:

   ```text
   /skill:egm-brainstorm Quero criar um app de controle de despesas pessoais, com cadastro de gastos, categorias e resumo mensal. Deve funcionar no navegador.
   ```

   Responda às perguntas e revise o arquivo `concepts_brief.md` gerado. Para uma feature, descreva a mudança desejada e seu contexto no projeto.

2. **Crie a especificação.**

   ```text
   /skill:egm-draft
   ```

   Revise as seções com o agente e anote o caminho do documento gerado.

3. **Revise a especificação.** Use o caminho informado na etapa anterior:

   ```text
   /skill:egm-review caminho/do/documento.md
   ```

   Escolha o modo de revisão, avalie os apontamentos e decida quais mudanças aplicar. A revisão usa subagentes com contexto novo; ela não substitui testes nem revisão humana.

4. **Implemente.** Após aprovar a especificação, peça ao agente:

   ```text
   Implemente o app conforme caminho/do/documento.md. Execute as verificações adequadas e informe os resultados.
   ```

   Para uma feature, substitua “o app” por “a feature”. Revise o código e os resultados antes de aceitar as alterações.

## Comandos adicionais

- `/skill:egm-resolve`: avalia e ajuda a resolver apontamentos de revisão.
- `/skill:egm-bootstrap`: cria ou atualiza documentação para entender um projeto existente; revise os arquivos gerados.
- `/skill:egm-drift-report`: compara a documentação de design com o código para identificar divergências.

As skills podem ser usadas separadamente. Para mudanças pequenas e claras, o fluxo completo pode ser desnecessário.

## Limitação no OMP

Segundo a [documentação de compatibilidade](https://github.com/google/elephant-goldfish-model/blob/main/docs/harnesses.md), as sete skills e os nove agentes foram verificados pela comunidade no OMP 18.12.6. O fluxo completo ainda não tem testes automatizados no OMP.
