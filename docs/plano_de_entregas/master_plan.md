# Plano de Entregas (Roadmap - Sunset App)

Este documento define o plano mestre de desenvolvimento em blocos lógicos 100% faturáveis, independentes e focados em agregar valor contínuo, de acordo com o Discovery realizado.

## Milestone 1: Fundação do App e Lazy Login (O Chassi)
**Objetivo:** Ter o "chassi" do carro rodando. Infraestrutura básica, estilização e sistema de contas fantasma.
**Foco do Discovery (Fraqueza 14 / Fortaleza 15)**
- Configuração do Next.js (com Next-PWA para Android/Web).
- Configuração do Tailwind CSS (Design System / Dark Mode).
- Setup do Supabase (Autenticação e Database).
- Implementação da lógica de "Lazy Login" / Autenticação por Device ID (Conta Fantasma) e fluxo opcional de Social Login (Google/Apple).

## Milestone 2: Mapa Core e Modo Bússola (A Navegação)
**Objetivo:** Permitir que o usuário navegue por um mapa de alto desempenho, mesmo em locais isolados.
**Foco do Discovery (Fraqueza 2 / Fraqueza 10)**
- Integração do Leaflet + OpenStreetMap.
- Implementação do `Leaflet.markercluster` para evitar poluição visual (Map Clutter).
- Leitura da geolocalização do usuário (GPS Tracking).
- Implementação da lógica "Modo Bússola/Radar" nativa (tela preta, bússola vetorial com fallback sem internet).

## Milestone 3: Sistema de Upload e Moderação Básica (Os Spots)
**Objetivo:** Criação do conteúdo central (pinos). "Abre o mapa, vê a foto, posta a foto".
**Foco do Discovery (Fraqueza 4 / Fraqueza 5 / Fraqueza 15)**
- Formulário de upload rápido de fotos.
- Integração com Supabase Storage (Upload).
- Validação de Coordenadas (Bloqueio de fraude de GPS > 1km).
- Marcadores D'água (Marca d'água invisível/visível no render para proteger Copyright - Fraqueza 11).

## Milestone 4: O Feed 'Pinterest' Híbrido (Descoberta)
**Objetivo:** Engajar usuários quando eles NÃO estão na rua (retenção diária).
**Foco do Discovery (Fortaleza 5 / Fraqueza 3)**
- Criação da interface dividida (Split Screen / Bottom Sheet) unindo Mapa Interativo + Feed.
- Algoritmo do feed exibindo fotos de alta qualidade baseadas em raio ou interesse.
- Ações básicas (Salvar no mapa dos sonhos, Curtir, Seguir criador).

## Milestone 5: Gamificação e Governança da Comunidade (Engajamento)
**Objetivo:** Gamificar as ações para atrair novos fotógrafos e blindar toxicidade.
**Foco do Discovery (Fortaleza 14 / Fraqueza 9 / Fraqueza 12 / Fraqueza 13)**
- Sistema de Rank/Patentes.
- Recompensa automática pela "Ação de Mapear" (Dopamina desvinculada de aprovação alheia).
- Sistema de denúncia e ocultação automática de spots (Strikes).
- Punição reversa por Review Bombing (Skin in the game).
- Lógica de "Dono do Ponto" com *Decay* (Decadência de tempo).

## Milestone 6: Inteligência Preditiva (A Magia)
**Objetivo:** Ajudar ativamente o usuário e lidar com clima.
**Foco do Discovery (Fortaleza 1 / Fraqueza 8)**
- Integração da API de clima Open-Meteo.
- Calculadora de Golden Hour via Suncalc (sugerindo horários).
- Recálculo de rota inteligente sugerindo locais indoor (cafés, museus) se chover na área do pino.

## Milestone 7: Lógica B2B e Expansão Monetizada (O Caixa)
**Objetivo:** Lançar as vias de captação financeira.
**Foco do Discovery (Fraqueza 6 / Fortaleza 13)**
- Spots Patrocinados (Destaque visual).
- Compra de "vagas" com escassez geográfica.

---

> **Atenção (Regra do SDLC):** Nenhuma destas subpastas de milestone deve ser gerada até o Founder dar o "OK" para iniciar a fase de Discovery do Milestone (DOR).
