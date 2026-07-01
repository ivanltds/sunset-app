# Product Requirements Document (PRD) - Milestone 4 (Feed)

## 1. Visão Geral
O Milestone 4 transforma o Sunset App de uma ferramenta de "Mapeamento" para uma "Rede Social Híbrida". O objetivo é reter a atenção do usuário mesmo quando ele está deitado no sofá, através de um Feed de Fotos em lista (estilo Pinterest) que trabalha em sincronia com o Mapa.

## 2. Casos de Uso
- **Navegação Híbrida:** O usuário arrasta uma "gaveta" (Bottom Sheet) para cima. O mapa diminui, e a tela vira uma grade de fotos vertical de lugares na mesma região (ou globais).
- **Interação Social (As "Moedas"):** Cada foto no feed terá 3 ações principais: 
  - Curtir (Coração).
  - Salvar (Bookmark - coloca o lugar num mapa privado de "sonhos").
  - Compartilhar (via URL externa).

## 3. Decisões Oficiais de Negócio (DOR Aprovado ✅)
O Milestone 4 atingiu o status de **DOR (Definition of Ready)** com as seguintes definições do Founder:

1. **Lógica do Feed:** Contextual ao Mapa. O feed exibe as fotos baseadas na região (bounding box) atual do mapa.
2. **Layout Fotográfico:** Estilo **Pinterest** (Grade Masonry com tamanhos de imagens dinâmicos).
3. **Mecânica de "Salvar":** O Bookmark (Salvar) transforma visualmente a cor do pino no mapa principal, marcando-o como "Lugar para ir".
4. **Nova Regra (Botão de + no Feed):** O botão flutuante (`+`) enquanto o Feed estiver aberto NÃO criará um Spot novo. Ele servirá para **adicionar uma nova foto a um Spot já existente**. Para criar um Spot do zero, o usuário precisará abaixar o Feed e usar o botão original do mapa.

## 4. Critérios de Aceite
- Gaveta deslizante implementada com suporte a touch no mobile.
- O Feed carrega fotos atreladas à tabela `spots` do banco de dados (layout Masonry ou Vertical).
- Botões de curtir inserem linhas na tabela de `likes` e atualizam a UI.
- Botão de bookmark insere o Spot na tabela `bookmarks`.
