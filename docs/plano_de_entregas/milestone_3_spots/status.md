# Status - Milestone 3 (Sistema de Upload e Os Spots)

**Status:** Concluído ✅
**Data de Conclusão:** 30/06/2026

## O que foi entregue:

### 1. Definição Oficial (DOR Aprovado)
- **Câmera:** Definida como Nativa (`<input capture>`).
- **GPS:** Definido como Arrastável (ajuste de pino).
- **Proteção Visual:** Definida como Marca D'água por sobreposição via Canvas.

### 2. Infraestrutura e Banco de Dados
- **Storage:** Bucket `spots` criado automaticamente no Supabase via Migration (`20260701025000_create_storage_buckets.sql`).
- **Segurança:** RLS ajustada tanto para o Storage (Select Público / Insert Auth) quanto para a tabela `spots` (resolvendo a limitação de `anon`).
- **Schema:** Adicionada a coluna `image_url` na tabela `spots` via Migration (`20260701030000_add_image_url_to_spots.sql`).

### 3. Utilitários (Engine Core)
- **Marca D'água (`src/lib/watermark.ts`):** Criada com sucesso. Comprime a foto no navegador (`<canvas>`), redesenha o tamanho máximo para 1080px e estampa "📍 Sunset App" no canto, convertendo para Blob e fazendo o upload.

### 4. Interface (UI / UX) e Integração
- **`SpotCreator.tsx`:** Bottom sheet responsivo implementado com:
  - Input invisível chamando Câmera nativa de celular.
  - Box de Preview fotográfico.
  - Mapinha do Leaflet travado no GPS do usuário para ajuste fino (Arraste do pino).
- Fluxo end-to-end acoplado na `page.tsx` através do novo botão de Câmera, revalidando a lista de spots automaticamente para feedback dopamínico instantâneo.
