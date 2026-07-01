# Product Requirements Document (PRD) - Milestone 3

## 1. Visão Geral
O Milestone 3 foca na mecânica central de criação de conteúdo do Sunset App: "Abre o mapa, tira a foto, posta o local". O usuário capturará uma foto no ambiente e criará um novo "Spot" no mapa.

## 2. Casos de Uso
- **Criar Spot:** O usuário clica em "Adicionar" e a câmera é acionada. Ele tira uma foto bonita do local e dá um título.
- **Validação de Presença (Anti-fraude):** O usuário deve estar **fisicamente** no local. O app captura o GPS na hora da foto e anexa o pino exatamente ali, evitando fraude de "pulos de localização" superiores a uma margem aceitável.
- **Proteção Visual:** A foto recebe uma marca d'água no canto inferior com o logo do app ou ID do usuário, garantindo a originalidade contra roubos em outras redes (Instagram/Pinterest).

## 3. Decisões Oficiais de Negócio (DOR Aprovado ✅)
O Milestone 3 atingiu o status de **DOR (Definition of Ready)** com as seguintes arquiteturas definidas pelo Founder:

1. **Captura da Câmera:** Usaremos a câmera **Nativa** do aparelho (`<input type="file" capture="environment">`) para máxima qualidade e estabilidade.
2. **Design da Marca D'água:** Faremos a sobreposição visual clássica na foto processada via `<canvas>` antes do upload, estampando o logo/ID no canto inferior.
3. **Rigidez do GPS:** O usuário pode **arrastar o pino** levemente no mapa durante a criação do Spot para ajustar imprecisões do GPS (margem maleável).

## 4. Critérios de Aceite
- O fluxo de criação de Spot é aberto sem falhas.
- A foto recebe processamento client-side (redimensionamento + marca d'água).
- O arquivo é enviado para o Supabase Storage com sucesso.
- O GPS é gravado na tabela `spots` e o pino aparece automaticamente na tela.
