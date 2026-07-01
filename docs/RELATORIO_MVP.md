# feed pessoal — Relatório de Entrega MVP

**Data:** Maio 2026  
**Stack:** Next.js 16 · Prisma 6 · Turso/libSQL · OpenAI GPT-4o-mini · Vercel

---

## Visão Geral

O **feed pessoal** é um leitor de notícias com curadoria diária gerada por IA. A cada dia, o sistema busca artigos de fontes RSS, normaliza títulos, gera resumos e monta uma edição personalizada com base nos interesses do usuário. O MVP entregue cobre o ciclo completo: onboarding, geração de edição, leitura, aprofundamento via chat e ajuste contínuo de preferências por comportamento.

---

## Funcionalidades Entregues

### Onboarding e Identidade

- Seleção de idioma na Landing Page via seletor discreto na navbar (suporta 10 idiomas)
- Fluxo de onboarding em steps: nome → tópicos de interesse → email opcional
- Email completamente opcional — botão "Agora não" encerra o onboarding sem cadastrar email
- Criação de usuário via cookie `userId` persistido no browser
- Preferências de tópicos e horário de edição salvos no banco

### Geração de Edição

- Busca de artigos via RSS (20 itens por feed, deduplicação por URL)
- Normalização de títulos e geração de resumos via GPT-4o-mini, no idioma do usuário
- Edição diária de até 30 itens distribuídos por tópico
- Botão "↺ Recriar feed" que apaga a edição do dia e gera uma nova do zero

### Ranking e Personalização

- Score por item = `peso_do_tópico × decaimento_de_recência × qualidade_da_fonte`
- Decaimento exponencial de recência (meia-vida ~8h): itens de 8h atrás valem 0.5, 16h valem 0.25
- Distribuição proporcional de vagas por tópico baseada nos pesos do usuário (mínimo 2 por tópico)
- Cap de 3 itens por fonte para evitar dominância de uma única origem
- Ajuste automático de pesos via feedback de comportamento:
  - Conversa com IA sobre o artigo: **+2.5**
  - Leitura do artigo original: **+1.5**
  - Skip (< 5s de visualização): **−0.5**

### Feed e Layout

- Seções organizadas por tópico, ordenadas pelo score médio dos itens (maior interesse primeiro)
- **Desktop:** hero de 2/3 + sidebar de 1/3 do tópico de maior interesse; seções em grid de 4 colunas para itens com foto; lista compacta para itens sem foto; tratamento de órfãos para evitar espaços vazios no grid
- **Mobile:** lista compacta unificada
- Placeholder cinza `#E3E2DC` em todos os cards enquanto imagem carrega
- Race condition de hidratação resolvida com `useImgStatus` (checa `img.complete` no `useEffect`)

### Modal de Notícia

- Abre ao clicar em qualquer card
- Exibe resumo gerado pela IA
- Gera 3 perguntas sugeridas via GPT-4o-mini ao abrir
- Skeleton de loading durante geração das perguntas
- Clique em uma pergunta navega para o chat de aprofundamento

### Chat de Aprofundamento (`/deep`)

- Interface de chat com histórico de mensagens
- Resposta via GPT-4o com contexto da notícia
- Animação de "digitando" (três dots bounce)
- Acessível pelo modal e pelo DoneScreen — implementação única via hook `useDeepDive`
- Cada uso do chat registra evento `deep_dive_question` para ajuste de pesos

### Tela de Conclusão (DoneScreen)

- Aparece quando o último card da edição fica visível
- Apresenta opções de aprofundamento e acesso às configurações

---

## Arquitetura Técnica

```
app/
  src/
    app/
      page.tsx                   # Server Component — carrega edição do dia
      onboarding/page.tsx        # Onboarding multi-step
      deep/page.tsx              # Chat de aprofundamento
      api/
        onboarding/route.ts      # Cria usuário (email opcional)
        build-edition/route.ts   # Gera edição para userId
        rebuild-edition/route.ts # Apaga edição do dia e regera
        feedback/route.ts        # Registra eventos e atualiza pesos
        questions/route.ts       # Gera 3 perguntas para um artigo
        deep-dive/route.ts       # Responde via GPT-4o
    components/
      LandingPage.tsx            # Hero + seletor de idioma + CTA
      EditionFeed.tsx            # Feed completo com layout editorial
      NewsCard.tsx               # Cards (hero, secondary, tile, compact)
      NewsModal.tsx              # Modal com resumo e perguntas
      DoneScreen.tsx             # Tela de fim de edição
      SettingsPanel.tsx          # Painel de preferências
    hooks/
      useDeepDive.ts             # Navegação unificada para /deep
    services/
      edition-builder.ts         # Orquestra busca → ranking → persistência
      ranker.ts                  # Score, cotas proporcionais, feedback deltas
      normalizer.ts              # GPT-4o-mini: título + resumo
      question-generator.ts      # GPT-4o-mini: 3 perguntas por artigo
    domain/
      news/types.ts              # RawNewsItem, NewsItem, SuggestedQuestion
    lib/
      prisma.ts                  # Singleton Prisma + adaptador libSQL
      openai.ts                  # Singleton OpenAI client
```

### Banco de Dados (Turso/libSQL)

| Tabela | Campos relevantes |
|---|---|
| `User` | `id`, `email?`, `name?`, `language`, `topics`, `editionHour`, `topicWeights` |
| `Edition` | `id`, `userId`, `date`, `items` (JSON) |
| `NewsItem` | `id`, `title`, `normalizedTitle`, `summary?`, `imageUrl`, `url`, `topic`, `sourceId`, `publishedAt` |
| `FeedbackEvent` | `id`, `userId`, `newsItemId`, `topic`, `type`, `createdAt` |

Migrações executadas via scripts Node.js com `@libsql/client` (SQLite não suporta `ALTER COLUMN`).

---

## Bugs Corrigidos

| Bug | Causa | Fix |
|---|---|---|
| Build Vercel falhava com tipos Prisma desconhecidos | `prisma generate` não rodava no CI | `"build": "prisma generate && next build"` |
| Onboarding travado em "Criando seu feed…" | Coluna `language` não existia no banco; sem try/catch no frontend | Migração `add-language-column.mjs` + try/catch com estado de erro |
| Imagens invisíveis no feed | Race condition: `onLoad` disparado antes da hidratação React | Hook `useImgStatus` com verificação de `img.complete` no `useEffect` |
| Ícone de imagem quebrada visível durante load | Imagem em `opacity-0` mas elemento quebrado ainda renderizado | Estado `'loading' | 'loaded' | 'failed'` com `opacity-0` até `onLoad` |
| `Objects are not valid as React child` | API de perguntas retornava strings; componente esperava objetos | API padronizada retornando `SuggestedQuestion[]` completos |
| Grid com espaços vazios (órfãos) | N itens não divisível por 4 colunas | `getColSpan()` distribui última linha proporcionalmente |
| Prisma não encontrado no Vercel (RHEL) | Binário gerado para Debian | `binaryTargets = ["native", "rhel-openssl-3.0.x"]` no schema |
| Server Component crash sem `OPENAI_API_KEY` | Construtor OpenAI lança exceção | Fallback `?? 'missing'` no client |
| `git index.lock` bloqueando commits | Lock file deixado por processo anterior | `Remove-Item .git\index.lock` |

---

## Decisões de Design Notáveis

**Email opcional por design:** A decisão de não obrigar cadastro de email reduz fricção no onboarding e permite que usuários experimentem o produto antes de se comprometer. A infra de envio (Resend) está no `package.json` para quando for habilitada.

**Uma única implementação do chat:** O hook `useDeepDive` garante que modal e DoneScreen naveguem para o mesmo `/deep` — qualquer mudança na experiência de chat reflete automaticamente nos dois pontos de entrada.

**Separação foto/sem-foto:** Itens com foto formam um grid visual; itens sem foto formam uma lista editorial abaixo. A separação é intencional — evita cards com placeholder cinza dominando o layout e dá identidade visual às duas camadas de conteúdo.

**Ranking proporcional ao interesse:** Em vez de um ranking global simples, cada tópico tem uma cota de vagas proporcional ao seu peso no perfil do usuário. Isso garante diversidade mesmo quando um tópico tem muitos artigos de alta recência.

---

## Deploy

- **Plataforma:** Vercel (plano Hobby)
- **CI/CD:** GitHub Actions → `vercel --prod` em push para `master`
- **Banco:** Turso (libSQL remoto), conexão via `DATABASE_URL` e `DATABASE_AUTH_TOKEN`
- **IA:** OpenAI API via `OPENAI_API_KEY`
- **Timeout de rotas pesadas:** `export const maxDuration = 60`

---

## Próximos Passos Naturais

- **Envio de email real:** infra com Resend já listada no `package.json`; falta implementar o template e o scheduler
- **Rastrear "ler artigo original"** como evento de feedback explícito (hoje só `long_read` por tempo de tela)
- **Cache de perguntas geradas** para não chamar a API a cada abertura do mesmo modal
- **Métricas de uso:** quantas edições geradas, taxa de conclusão, tópicos mais clicados
- **PWA / push notifications** para notificar quando a edição do dia estiver pronta
