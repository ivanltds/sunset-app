# Sunset App

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) and uses [Supabase](https://supabase.com/) as the backend.

## Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (versão recomendada: LTS)
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/) ou [pnpm](https://pnpm.io/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (necessário para rodar o Supabase localmente)
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)

## Passo a Passo para Rodar Localmente

### 1. Clonar e Instalar Dependências

Instale as dependências do projeto na raiz:

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 2. Subir o Supabase Localmente

Com o Docker em execução (ex: Docker Desktop aberto), inicie os serviços locais do Supabase na raiz do projeto:

```bash
npx supabase start
```
*Observação: se você instalou o CLI globalmente, pode usar `supabase start`.*

Após a inicialização, o terminal exibirá as credenciais locais, como a `API URL` e a `anon key`. O painel do Supabase Studio (banco de dados) ficará disponível, geralmente, em [http://localhost:54323](http://localhost:54323).

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto e adicione as chaves fornecidas no passo anterior:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_api_url_local
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_local
```

### 4. Aplicar Migrations (Opcional/Se houver)

Se já existirem arquivos de migração de banco de dados (`supabase/migrations`), você pode aplicá-los com:

```bash
npx supabase db push
```

### 5. Iniciar o Servidor de Desenvolvimento do Next.js

Com o backend rodando e o `.env.local` configurado, inicie o app:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado! Você pode editar a página modificando o arquivo `app/page.tsx` (ou os componentes no seu projeto) - a interface atualiza automaticamente.

### 6. Acessar via Celular (HTTPS com Cloudflare / Localtunnel)

Se você precisa testar funcionalidades que exigem HTTPS no celular (como Geolocalização da Câmera/Mapa), você precisará criar um túnel para expor o seu `localhost` para a internet.

**Opção 1: Cloudflare Tunnel (Recomendado)**
1. Baixe o [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) e instale no seu computador.
2. Em um novo terminal, rode o comando:
```bash
cloudflared tunnel --url http://localhost:3000
```
3. O terminal irá gerar um link com `https://<nomes-aleatorios>.trycloudflare.com`. Abra este link no seu celular.

**Opção 2: Localtunnel (Mais prático via npx)**
Se não quiser instalar o Cloudflare no Windows, você pode rodar o Localtunnel diretamente pelo Node:
```bash
npx localtunnel --port 3000
```
Isso vai gerar um link HTTPS (`https://....loca.lt`) que você pode abrir no seu celular para testar.
