# Technical Design - Milestone 3

## 1. Arquitetura do Cliente
- **Componente Core (`SpotCreator.tsx`):** Será uma Bottom Sheet (gaveta que sobe do rodapé) acionada por um FAB (Floating Action Button) de "+" na tela principal.
- **Processamento de Imagem (`src/lib/watermark.ts`):** 
  - Usaremos FileReader para ler a foto nativa e carrega-la em uma imagem `Image()`.
  - Usaremos `<canvas>` do HTML5 em memória para desenhar a imagem redimensionada (max 1080px de largura/altura) para economizar banda/storage.
  - No mesmo canvas, usaremos `ctx.fillText` e `ctx.shadow` para carimbar "📍 Sunset App" no canto inferior direito.
  - Exportaremos via `canvas.toBlob("image/jpeg", 0.8)`.
- **Geolocalização:** Ao abrir o SpotCreator, chamamos `navigator.geolocation.getCurrentPosition()` e travamos a coordenada em estado.

## 2. Banco de Dados / Migrations
- **Arquivo `20260701XXXXXX_create_storage_buckets.sql`:**
  - Script SQL para automatizar a criação do bucket público `spots` diretamente na tabela interna `storage.buckets`.
  - Políticas de RLS de Storage:
    - `SELECT`: Público (qualquer visitante pode ver as fotos no mapa).
    - `INSERT`: Limitado apenas aos `authenticated` users (nossas contas fantasmas vinculadas a Device ID).
- **Tabela `spots`:**
  - Garantir que a coluna `image_url` exista e armazene a string gerada após o upload do Supabase.

## 3. Fluxos (Data Flow)
1. Clicar em "Novo Spot" -> UI Abre Bottom Sheet.
2. Clicar em "Tirar Foto" -> Trigger `<input type="file" capture="environment">`.
3. Selecionar Foto -> Dispara `watermark.ts` (compressão e logo).
4. Submeter -> `supabase.storage.from('spots').upload(file)`.
5. Receber a URL pública gerada no Storage.
6. Inserir (INSERT) linha no banco na tabela `spots` com Título, GPS travado, User_id fantasma e a Image URL.
7. O Mapa revalida o array de spots e renderiza o novo pino.
