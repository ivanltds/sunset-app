# Status - Milestone 4 (O Feed 'Pinterest' Híbrido)

## Lista de Tarefas (Aguardando DOR)

### 1. Definição (DOR)
- [ ] Obter as respostas arquiteturais do Founder (Lógica de Raio vs Global, Layout do Grid, Reação visual do Bookmark no mapa).
- [ ] Atualizar este documento após definição.

### 2. Infraestrutura e Banco de Dados (Social)
- [ ] Criar Migration `20260701XXXXXX_create_social_tables.sql` (likes, bookmarks).
- [ ] Criar RLS Policies para `spot_likes` e `spot_bookmarks`.
- [ ] Aplicar migrations no banco local/remoto.

### 3. Interface (Feed e Gestos)
- [ ] Criar Componente `FeedView.tsx` (Split Screen Bottom Sheet).
- [ ] Integrar lógica de drag (arrastar pra cima/baixo) com CSS ou Framer Motion.
- [ ] Criar Layout do Grid de Imagens (Pinterest-style Masonry ou List).
- [ ] Adicionar os botões overlay de "Salvar" e "Curtir" em cada Card da imagem.

### 4. Lógica de Integração
- [ ] Fetch dos likes e bookmarks via Supabase na inicialização.
- [ ] Toggle Function Otimista (Like/Unlike e Bookmark/Unbookmark).
- [ ] Sincronização: Bookmark altera a cor do marcador (Marker) do Leaflet no `MapEngine`.
