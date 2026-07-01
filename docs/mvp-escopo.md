# Escopo do MVP — feed-pessoal
**Data:** Maio de 2026  
**Objetivo:** Produto testável com amigos próximos para validar as hipóteses centrais  
**Stack:** Next.js · React · TypeScript  
**Horizonte:** Funcional para teste em ambiente local ou Vercel (sem infraestrutura de produção)

---

## Hipóteses que o MVP precisa validar

1. A edição diária com fim entrega satisfação real de "estou em dia"
2. As 3 perguntas sugeridas ao final são tocadas espontaneamente (sem explicação)
3. O Modo 2 (AI + cards) entrega valor suficiente para o usuário querer voltar amanhã

---

## O que está dentro do MVP

### Modo 1 — Edição Diária

**Feed com 7 notícias curadas**
- Busca notícias de múltiplas fontes via RSS ou NewsAPI
- Exibe cada notícia como card com: imagem, título normalizado (anti-clickbait via LLM), fonte e timestamp
- Ordenação inicial por relevância básica (sem ranking aprendido ainda — seed manual ou por categoria)
- Scroll termina. Não há "carregar mais". A edição tem 7 itens e acabou.

**Tela de conclusão**
- Ao rolar o último card, exibe: "Você está em dia ✓" + data + 3 perguntas sugeridas geradas por IA com base no item com maior interação (tempo de leitura)
- As 3 perguntas são o único CTA da tela

**Normalização de título**
- Cada título passa por prompt LLM antes de exibir: remove clickbait, reduz sensacionalismo, mantém informação
- Versão MVP: silenciosa (sem mostrar o original ao lado)

---

### Modo 2 — Aprofundamento

**Entrada via pergunta sugerida**
- Usuário toca em uma das 3 perguntas → abre tela de conversa
- A pergunta já está enviada — a conversa começa imediatamente com resposta da IA
- A IA tem contexto do artigo relacionado + pergunta escolhida

**Interface de conversa**
- Mensagens da IA em balões com suporte a markdown
- Links e notícias relacionadas aparecem como cards clicáveis (imagem + título + fonte)
- Usuário pode digitar follow-ups após a resposta inicial
- Botão "Voltar para a edição" sempre visível

---

### Entrega da edição

**Email (prioritário no MVP)**
- Envio diário às 7h via Resend ou Nodemailer
- Template HTML simples: os 7 cards com imagem, título e link para abrir o app
- Link "Ver edição completa" abre o app/web com a edição do dia
- As 3 perguntas sugeridas aparecem no fim do email como links → abrem o Modo 2 diretamente

**WhatsApp (pós-MVP ou versão simplificada)**
- Para o MVP: mensagem simples via Twilio com link para o app
- Cards visuais ficam no app — WhatsApp só notifica

---

### Feedback e personalização

O feedback do usuário **muda o feed do dia seguinte**. Esse é o diferencial central e precisa ser real no MVP — não um stub.

#### Mecanismo de feedback loop (simples, sem ML)

Cada usuário tem um mapa de pesos por tema (`user_topic_weights`). Começa com os valores do onboarding e é atualizado ao final de cada sessão:

| Sinal | Peso | Lógica |
|---|---|---|
| Pergunta tocada no Modo 2 | +2 no tema relacionado | Sinal mais forte — curiosidade genuína e intencional |
| Tempo no card > 20s | +1 no tema do card | Proxy de atenção — leu de verdade |
| Card passado em < 5s | -0.5 no tema do card | Proxy de desinteresse |
| Categoria escolhida no onboarding | Peso inicial = 5 | Seed antes de ter dados de uso |
| Categoria não escolhida | Peso inicial = 1 | Presente mas desprioritizada |

#### Como o ranker usa esses pesos

Na hora de montar a edição do dia seguinte:
1. Busca candidatos de todas as fontes ativas (20–40 artigos)
2. Para cada candidato, calcula: `score = topic_weight * recency_score * source_quality`
3. Seleciona os 7 com maior score, garantindo no mínimo 2 temas diferentes (diversidade mínima)
4. Normaliza títulos e monta a edição

#### Evolução percebida pelo usuário
- **Dia 1:** Feed genérico por categorias do onboarding
- **Dia 3:** Visivelmente diferente para quem interage — temas favoritos aparecem mais
- **Dia 7:** Feed parece personalizado de verdade — o usuário reconhece que "aprendeu"

#### Schema necessário

```sql
-- Adicionado ao schema Prisma
model UserTopicWeight {
  id        String   @id @default(cuid())
  userId    String
  topic     String   -- "Tecnologia", "Economia", etc.
  weight    Float    @default(1.0)
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id])
  @@unique([userId, topic])
}

model FeedbackEvent {
  id        String   @id @default(cuid())
  userId    String
  newsItemId String
  type      String   -- "deep_dive_question" | "long_read" | "skip"
  topic     String
  delta     Float    -- variação aplicada ao peso
  createdAt DateTime @default(now())
}
```

**Não tem no MVP:** botões de like/dislike, avaliação explícita, instrução em linguagem natural

---

### Onboarding

Fluxo único de 3 telas:
1. "Quais temas te interessam?" — selecionar de 6 a 8 categorias (Tecnologia, Economia, Geopolítica, Ciência, Brasil, Mundo, Cultura, Esportes)
2. "A que horas você quer receber sua edição?" — manhã (7h) ou noite (19h)
3. "Qual seu email?" — para entrega da edição

Sem autenticação complexa no MVP. Email como identificador.

---

## O que está fora do MVP

| Feature | Motivo |
|---|---|
| Ranking aprendido por feedback | Precisa de dados acumulados — começa no dia 3+ |
| Instrução em linguagem natural | Complexidade de UX e IA — fase 2 |
| WhatsApp rico (cards visuais) | Limitação técnica do canal |
| Multi-perfil / múltiplos usuários | Fora do escopo de teste com amigos |
| Deduplicação de notícias | Relevante com volume maior de fontes |
| Título original vs. normalizado lado a lado | Decisão pendente — não bloqueia o MVP |
| App nativo (iOS/Android) | Web responsiva é suficiente para o teste |
| Moderação de fontes | Curadoria manual no MVP |
| Cache e infraestrutura de produção | Vercel + edge suficiente para teste |

---

## Arquitetura técnica do MVP

```
feed-pessoal/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Edição do dia (Modo 1)
│   ├── done/page.tsx             # Tela de conclusão + perguntas sugeridas
│   ├── deep/[questionId]/        # Modo 2 — conversa com IA
│   └── onboarding/page.tsx       # Fluxo de setup
│
├── src/
│   ├── domain/
│   │   ├── news/                 # Entidade NewsItem, normalização de título
│   │   ├── edition/              # Entidade Edition, lógica de composição
│   │   ├── feedback/             # Registro de interações
│   │   └── ranking/              # Ranker plugável (stub no MVP)
│   │
│   ├── adapters/                 # Fontes de notícias plugáveis
│   │   ├── rss/                  # Adaptador RSS genérico
│   │   ├── newsapi/              # Adaptador NewsAPI
│   │   └── index.ts              # Registry de fontes ativas
│   │
│   ├── services/
│   │   ├── title-normalizer.ts   # LLM para anti-clickbait
│   │   ├── question-generator.ts # LLM para as 3 perguntas sugeridas
│   │   ├── deep-dive.ts          # Conversa IA do Modo 2
│   │   └── email-sender.ts       # Envio da edição por email
│   │
│   └── components/
│       ├── NewsCard/             # Card visual (imagem + título + fonte)
│       ├── EditionFeed/          # Lista de 7 cards com scroll finito
│       ├── DoneScreen/           # Tela de conclusão + perguntas
│       ├── DeepDiveChat/         # Interface de conversa Modo 2
│       └── RelatedCard/          # Card de link relacionado no Modo 2
│
├── prisma/                       # SQLite local para MVP
│   └── schema.prisma             # User, Edition, NewsItem, Feedback
│
└── scripts/
    └── generate-edition.ts       # Cron: buscar → normalizar → rankear → salvar edição
```

---

## Fontes de notícias para o MVP (curadoria manual)

| Categoria | Fonte | Adaptador |
|---|---|---|
| Brasil | G1, Folha, Agência Brasil | RSS |
| Mundo | Reuters, BBC, Associated Press | RSS |
| Tecnologia | TechCrunch, The Verge, Wired | RSS |
| Economia | Valor Econômico, Bloomberg | RSS |
| Ciência | Science Daily, MIT Tech Review | RSS |
| Cultura | Pitchfork, The Atlantic | RSS |

Adicionar nova fonte = criar arquivo em `src/adapters/` + registrar em `index.ts`. Remover = comentar do registry.

---

## APIs e serviços externos necessários

| Serviço | Uso | Custo estimado (MVP) |
|---|---|---|
| Anthropic Claude API | Normalização de título + geração de perguntas + Modo 2 | ~$5–20/mês para teste com amigos |
| Resend | Envio de email da edição diária | Gratuito até 3.000 emails/mês |
| Vercel | Deploy do Next.js | Gratuito (hobby) |
| PlanetScale ou SQLite local | Persistência de usuários, edições e feedback | Gratuito no MVP |

---

## Critérios de sucesso do teste com amigos

O MVP serve para validar, não para impressionar. Defina com antecedência o que seria um sinal positivo:

- **Retenção D3:** pelo menos 3 de 5 amigos abriram a edição nos primeiros 3 dias
- **Modo 2:** pelo menos 1 pergunta tocada por usuário nos primeiros 3 dias
- **Feedback qualitativo:** ao perguntar "como você se sentiu ao terminar a edição?", ouvir "satisfeito" ou "pronto" — não "com vontade de ver mais no feed"
- **NPS informal:** "Você indicaria isso para alguém?" — maioria diz sim

---

## Ordem de construção sugerida

1. Adaptadores RSS + busca de notícias (dados reais desde o início)
2. Normalização de título via LLM (validar qualidade antes de mostrar para usuários)
3. Tela da edição (Modo 1) — 7 cards com scroll finito
4. Tela de conclusão + geração das 3 perguntas
5. Modo 2 — conversa IA com cards relacionados
6. Onboarding (3 telas)
7. Envio por email (Resend)
8. Deploy no Vercel + convite para amigos

---

*Decisões pendentes registradas em brainstorming-descobertas.md — não bloqueiam o início da construção.*
