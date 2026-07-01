# Status - Milestone 4 (O Feed 'Pinterest' Híbrido)

## Lista de Tarefas (Concluído)

### 1. Definição (DOR)
- [x] Obter as respostas arquiteturais do Founder (Lógica de Raio vs Global, Layout do Grid, Reação visual do Bookmark no mapa).
- [x] Atualizar este documento após definição.

### 2. Infraestrutura e Banco de Dados (Social)
- [x] Criar Migration `20260701XXXXXX_create_social_tables.sql` (likes, bookmarks).
- [x] Criar RLS Policies para `spot_likes` e `spot_bookmarks`.
- [x] Aplicar migrations no banco local/remoto.

### 3. Interface (Feed e Gestos)
- [x] Criar Componente `FeedView.tsx` (Split Screen Bottom Sheet).
- [x] Integrar lógica de drag (arrastar pra cima/baixo) com CSS ou Framer Motion.
- [x] Criar Layout do Grid de Imagens (Pinterest-style Masonry ou List).
- [x] Adicionar os botões overlay de "Salvar" e "Curtir" em cada Card da imagem.

### 4. Lógica de Integração
- [x] Fetch dos likes e bookmarks via Supabase na inicialização.
- [x] Toggle Function Otimista (Like/Unlike e Bookmark/Unbookmark).
- [x] Sincronização: Bookmark altera a cor do marcador (Marker) do Leaflet no `MapEngine`.
