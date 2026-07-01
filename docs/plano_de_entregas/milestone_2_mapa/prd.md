# Product Requirements Document (PRD) - Milestone 2: Mapa Core e Modo Bússola

## 1. Objetivo do Milestone
Implementar o coração da navegação do **Sunset App**: o Mapa Interativo de alto desempenho. O usuário deve ser capaz de abrir o app, visualizar um mapa escuro/premium, ver sua localização (GPS Tracking), navegar e transicionar para o modo "Bússola/Radar" para explorar o entorno sem dependência pesada de internet para mapas detalhados.

## 2. Requisitos de Negócio (Regras)
- **R1 - Motor de Mapa:** Utilizar `react-leaflet` com tiles do OpenStreetMap estilizados para alto contraste (Light/Dark Mode dependendo da decisão visual global, mas mantendo a estética premium e limpa).
- **R2 - Agrupamento de Pinos (Clustering):** Para evitar a poluição visual de centenas de pontos (Map Clutter), deve-se usar o `react-leaflet-cluster` (ou similar) para agrupar marcadores que estão muito próximos dependendo do nível de zoom.
- **R3 - GPS Tracking Instantâneo:** Ao aprovar permissões de localização, a câmera do mapa deve dar um *flyTo* suave para a coordenada do usuário e mantê-lo centralizado via tracking.
- **R4 - Modo Bússola/Radar:** Uma interface abstrata e *gamificada*. Quando acionado, o mapa clássico se oculta. Uma interface preta vetorial exibe pontos ao redor usando cálculos trigonométricos simples baseados no giroscópio (orientação) e GPS. Isso reduz distração e consumo de dados.

## 3. Fora do Escopo (Não Fazer Agora)
- Criação e envio de novos spots/fotos (Milestone 3).
- Feed estilo Pinterest (Milestone 4).
- Sistema de likes e gamificação.

## 4. Casos de Uso (User Stories)
- **Como um explorador**, eu quero abrir o aplicativo e ver imediatamente onde eu estou no mapa, para me orientar rapidamente.
- **Como um fotógrafo urbano**, eu quero ver aglomerados numéricos de fotos em locais densos em vez de uma nuvem ilegível de pinos.
- **Como um usuário sem pacote de dados (offline)**, eu quero alternar para o "Modo Bússola", onde a interface me guia como um radar para os pontos baixados previamente, sem tentar carregar imagens pesadas de mapa.
