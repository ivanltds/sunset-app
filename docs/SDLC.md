# Software Development Life Cycle (SDLC) - Sunset App

Este documento serve como o orquestrador principal de todo o ciclo de vida de desenvolvimento do Sunset App. 

## 1. Regras do Jogo
1. **Trabalho Orientado a Milestones:** O projeto é construído estritamente através de Milestones independentes e com valor agregado. Não avançamos para o próximo Milestone sem concluir o atual.
2. **Autorização Explícita:** Nenhum código deve ser escrito e nenhuma pasta de Milestone deve ser criada sem o "OK" explícito do Fundador (Ivan).
3. **Regra de Ouro (DOR - Definition of Ready):** O desenvolvimento técnico de um Milestone SÓ SE INICIA quando o Milestone estiver **100% DOR**. Isso significa que as seguintes etapas foram validadas pelo Fundador:
   - **PRD (Product Requirements Document):** Regras de negócio, escopo e fluxos claros.
   - **Wireframes/Design:** A visão de interface (em HTML ou texto/mocks) está aprovada.
   - **Definição Técnica:** Arquitetura de banco de dados, bibliotecas e rotas estão definidas e validadas.
4. **Contexto Contínuo:** O arquivo `contexto.md` deve ser atualizado sempre que houver mudança de estado (início de milestone, alteração de status, impedimentos).

## 2. Estrutura de Pastas de Entrega
Todo o planejamento de código e design vive na pasta `/plano_de_entregas`.
Quando um Milestone (ex: `milestone_1_fundacao`) for autorizado, sua subpasta será criada contendo a seguinte estrutura obrigatória:
- `/prd.md`: O documento de requisitos e regras de negócio fatiado a nível de detalhe.
- `/wireframes.html`: Estrutura base da interface que será construída.
- `/tech_design.md`: A definição técnica, schema do DB, rotas da API, e componentes chave.
- `/status.md`: Lista de tarefas quebradas ao nível mais granular possível (To Do, In Progress, Done).

## 3. Fluxo de Trabalho (Orquestração)
Sempre que você mencionar "Vamos iniciar o SDLC" ou "Invoque o SDLC", o agente de IA deverá:
1. Ler este documento (`SDLC.md`) para relembrar as regras.
2. Ler o `contexto.md` para saber exatamente onde paramos.
3. Perguntar/Propor o próximo passo de documentação do Milestone atual.
4. Aguardar o OK para fatiar as tarefas no `status.md`.
5. Só iniciar o código do Milestone atual se a tag **DOR** estiver aprovada.

## 4. Master Plan (Onde estamos?)
A visão geral de todas as entregas planejadas (e a prioridade de lançamento) vive no arquivo `plano_de_entregas/master_plan.md`. Consulte-o para saber o Roadmap.
