# Technical Design - Milestone 4 (Feed)

## 1. Arquitetura da Interface (Split Screen)
- Componente `FeedView.tsx` renderizado acima do mapa.
- Usaremos a API de gestos ou uma biblioteca leve de arrastar (ex: `react-spring` ou `framer-motion`) para permitir que a "gaveta" suba e desça de forma responsiva no celular.

## 2. Modelagem do Banco de Dados (Supabase)
Precisaremos de novas tabelas via Migrations para comportar o engajamento social.
- **Tabela `spot_likes`**:
  - `id` (UUID)
  - `user_id` (Referências de ghost_users / auth.users)
  - `spot_id` (Referências de spots)
  - Constraints: UNIQUE(`user_id`, `spot_id`) para evitar likes duplicados.
- **Tabela `spot_bookmarks`**:
  - Mesma estrutura do Like, mas armazena a intenção de visita futura.

## 3. Fluxo e Integração de Dados (Data Flow)
- **Modo Mapa:** `page.tsx` continua passando a lista de Spots pro `MapEngine`.
- **Modo Feed:** Quando o usuário puxa o menu, `page.tsx` passa a lista filtrada para o `FeedView`.
- **Reactividade:** Quando o usuário clica no ♥ (Like), o app faz um UPSERT otimista na tabela `spot_likes`, mudando o ícone para vermelho imediatamente (sem loading aparente), e trata erros silenciosamente.
