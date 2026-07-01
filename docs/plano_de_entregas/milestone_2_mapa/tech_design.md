# Technical Design Document - Milestone 2: Mapa Core e Modo Bússola

## 1. Arquitetura do Mapa
Para o **Sunset App**, precisamos de alta performance no Mobile Web (PWA) e controle total da UI.
- **Biblioteca Base:** `leaflet` e `react-leaflet`.
- **Map Tiles:** OpenStreetMap via fornecedor de alto contraste (ex: CartoDB Positron ou Dark Matter, configurado conforme o Light Mode já validado).
- **Gerenciador de Clusters:** `react-leaflet-cluster` (wrapper para o `leaflet.markercluster`).

## 2. Abstrações e Componentes (React / Next.js)
- **`<MapEngine />`:** Componente Wrapper. No Next.js App Router, ele DEVE possuir a diretiva `"use client"` e usar importação dinâmica (`next/dynamic` com `ssr: false`), já que o Leaflet injeta variáveis na `window` e quebra no lado do Servidor.
- **`<UserMarker />`:** Componente rastreador que lê `navigator.geolocation.watchPosition` e atualiza continuamente as coordenadas do usuário.
- **`<CompassMode />`:** Um *Overlay* ou Rota separada desenhada com Canvas/SVG. Lê `DeviceOrientationEvent` (Alpha/Giroscópio) para girar a bússola vetorial conforme o celular aponta, cruzando com a fórmula de *Haversine* para calcular distância dos pinos próximos.

## 3. Modelo de Dados / Banco (Mocking Inicial)
Como ainda não temos upload (M3), criaremos alguns pontos (Spots) mockados via *Seed* ou inserção manual no Supabase para validar o Cluster e a Bússola.
- **Tabela:** `spots`
  - `id` (uuid)
  - `user_id` (uuid) - FK users
  - `lat` (float)
  - `lng` (float)
  - `title` (string)

## 4. Segurança e Performance
- Evitar renderizações excessivas do `<MapEngine />` usando memoização (`React.memo`) ao receber novas coordenadas de GPS.
- No Modo Bússola, limitar a taxa de atualização do Giroscópio (throttle) para poupar bateria e processamento do celular.
