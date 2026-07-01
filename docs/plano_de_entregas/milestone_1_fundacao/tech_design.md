# Definição Técnica - Milestone 1

## 1. Stack Tecnológica Base
- **Framework:** Next.js 14+ (App Router).
- **Estilo:** Tailwind CSS (Utility-first, configurado com foco no `dark:`).
- **PWA:** `next-pwa` configurado no `next.config.js` apontando para o manifesto (manifest.json e ícones) no diretório `public`.
- **Backend/DB:** Supabase. Utilizaremos o SDK oficial `@supabase/supabase-js`.

   - Salva no `localStorage`.
   - Faz um POST/INSERT anônimo no Supabase na tabela `users` definindo `id = UUID`, `is_ghost = true`.
3. Se existir:
   - Mantém o ID em memória via context/Zustand para assinar requisições futuras de "Curtidas" ou "Salvos".

## 4. Estrutura de Arquivos Iniciais
```text
/app
 ├── layout.tsx (Implementação do script PWA e provider do LazyLogin)
 ├── globals.css (Configuração de tailwind base, dark mode puro)
 └── page.tsx (Tela temporária de Splash/Dashboard base para confirmar que funciona)
/lib
 └── supabaseClient.ts (Conexão via ENV vars)
 └── auth.ts (Lógica de gerar/resgatar o Device ID Fantasma)
/public
 ├── manifest.json
 └── icons/ (192x192, 512x512 para o PWA)
```
