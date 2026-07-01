# Descobertas do Brainstorming — feed-pessoal
**Data:** Maio de 2026  
**Sessão:** Exploração do espaço do problema  
**Modo:** Problem Exploration → Convergência

---

## Usuário-alvo escolhido

**O Sobrecarregado Ansioso**

Abre Google News ou Instagram de manhã, passa 20 minutos rolando, fecha sentindo que perdeu tempo. Não sabe o que era importante de verdade. Sente culpa e ansiedade. Quer estar informado mas não consegue parar o ciclo.

O problema dele não é falta de notícias — é excesso sem qualidade e sem fechamento.

---

## Raiz do problema (duas camadas sobrepostas)

### Camada 1 — Conteúdo ruim
O feed entrega clickbait, sensacionalismo e viés. O usuário não confia no que lê e sente que "perdeu tempo com lixo". Solução: curadoria, anti-clickbait, relevância personalizada.

### Camada 2 — Ausência de fechamento
O feed é infinito por design. Não existe um ponto onde o usuário "terminou as notícias de hoje". O loop nunca fecha, a ansiedade não diminui. Solução: formato com fim — edição diária estruturada.

**Insight central:** O fechamento é o problema primário. O conteúdo ruim é o que impede o fechamento de ser satisfatório. Um feed infinito de conteúdo perfeito ainda é infinito.

---

## Visão do produto que emergiu

O produto tem dois modos distintos com estados emocionais diferentes:

### Modo 1 — Edição Diária
- Tem início, meio e fim
- Entrega a sensação de "estou em dia"
- É o ritual — o usuário entra sabendo que vai sair
- Conteúdo curado, títulos normalizados, relevância personalizada
- Resolve a ansiedade de loop aberto

### Modo 2 — Aprofundamento (ativado por curiosidade, não por hábito)
- Ativado ao final da edição: 3 perguntas sugeridas sobre o tema com maior interação do usuário
- Zero typing para iniciar — o usuário toca em uma pergunta e a conversa já começou
- IA responde com contexto, dados e links em cards visuais
- Resolve a curiosidade genuína sem criar novo loop de scroll

---

## Por que as 3 perguntas sugeridas são o diferencial real

- **Resolve adoção:** Não exige decisão ativa nem digitação. O usuário em modo passivo de consumo não vai abrir um campo de texto.
- **Gera sinal rico:** A pergunta escolhida revela a *dimensão* que importa ao usuário (impacto econômico? contexto histórico? implicação geopolítica?). É mais preciso que curtir ou tempo de leitura.
- **Cria dependência saudável:** Uma boa pergunta sugerida é difícil de ignorar. Esse é o gancho de retenção do Modo 2.

**Qualidade das perguntas é tudo.** A diferença entre "Quer saber mais sobre energia solar?" e "Por que o Brasil adota solar mais rápido que a Alemanha mesmo com menos subsídio?" é a diferença entre feature ignorada e feature que cria hábito.

O trabalho de IA mais importante do produto não é resumir notícias — é **gerar perguntas genuinamente interessantes** a partir do consumo do usuário.

---

## Hipóteses a validar (em ordem de risco)

| # | Hipótese | Risco se errada | Como testar |
|---|---|---|---|
| 1 | O usuário sente a ausência de fechamento como dor real, não só como inconveniência | Alta — é a fundação do produto | Pesquisa qualitativa: "Como você se sente quando fecha o app?" |
| 2 | Uma edição diária com fim entrega satisfação real de "estou em dia" | Alta — define o formato central | Protótipo de baixa fidelidade: simular edição com 10 itens e observar comportamento |
| 3 | O usuário toca nas perguntas sugeridas ao final da edição | Média — define o Modo 2 | Teste A/B: fim de edição com vs. sem perguntas sugeridas |
| 4 | Perguntas específicas e provocadoras têm CTR muito maior que perguntas genéricas | Média — define qualidade do produto | Teste com variações de perguntas no Modo 2 |
| 5 | O usuário percebe e valoriza títulos normalizados vs. originais | Baixa no MVP — mas importante para posicionamento | Mostrar lado a lado e pedir reação |

---

## Plano de pesquisa — próxima semana

**Objetivo:** Validar as hipóteses 1 e 2 antes de qualquer protótipo.  
**Método:** 3 conversas de 20 minutos com você mesmo + amigos próximos que se encaixam no perfil.  
**Não explique o produto.** Ouça o comportamento atual.

### Roteiro de conversa

**Sobre comportamento atual:**
"Me conta como foi a última vez que você leu notícias. Onde estava, que horas eram, o que abriu primeiro."
→ Deixa ele recontar. Observe: há ritual? Há culpa? Há frustração?

**Sobre fechamento:**
"Quando você fecha o app de notícias, como você se sente normalmente?"
→ Hesitação é sinal. "Aliviado" vs. "culpado" vs. "entediado" — cada resposta revela algo diferente.

**Sobre aprofundamento:**
"Teve alguma notícia recentemente que te fez querer saber mais? O que você fez depois?"
→ Revelará se o Modo 2 já existe na vida real e em que formato.

**Sobre edição com fim:**
"Você já teve a sensação de ter terminado de ler as notícias do dia?"
→ "Não, isso não existe" = validação do problema.
→ "Sim, quando leio [newsletter X]" = concorrente não mapeado + aprender o que funciona.

### O que capturar
- Citações diretas (as palavras exatas que usam para descrever a dor)
- Comportamentos observados (o que fazem, não o que dizem que fariam)
- Surpresas — qualquer coisa que contradiga o que você assumia

---

## O que está fora do escopo por agora

- Multi-perspectiva por story (Particle faz bem, não competir agora)
- Detecção de viés político binário (Ground News faz bem, não competir agora)
- Cobertura local (Google/SmartNews têm vantagem estrutural)
- Resumos automáticos de artigo como feature central

---

## Próximas decisões de produto (pós-research)

1. **Formato da edição:** Quantos itens? Fixo ou variável? A que horas "publica"?
2. **Entrada no app:** Notificação push ("sua edição está pronta") ou abertura ativa?
3. **Onboarding do Modo 2:** Como o usuário descobre que pode aprofundar sem que você explique?
4. **Modelo de feedback:** O toque nas perguntas sugeridas já é sinal suficiente, ou precisa de feedback explícito adicional?

---

*Gerado a partir de sessão de product brainstorming. Próximo passo: pesquisa qualitativa com 3 usuários antes de qualquer protótipo.*

---

## Decisões confirmadas na sessão

| Decisão | Escolha | Observação |
|---|---|---|
| Usuário-alvo | Sobrecarregado Ansioso | Perfil A |
| Dois modos | Edição Diária + Aprofundamento | Estrutura central do produto |
| Entrada no Modo 2 | 3 perguntas sugeridas ao final da edição | Zero typing, tap para iniciar |
| Modelo de feedback | Tap nas perguntas sugeridas é suficiente | Sem botões adicionais no MVP |
| Canais de entrega | Email + WhatsApp + app | Email prioritário no MVP |
| Formato da edição | ~7 itens, às 7h da manhã | Referência para testar — não confirmado |

---

## Decisões pendentes (validar pós-research ou pós-MVP)

| # | Decisão pendente | Por que importa |
|---|---|---|
| 1 | Número exato de itens na edição (fixo ou variável?) | Define a sensação de "terminei" — muito pouco parece raso, muito parece feed |
| 2 | Horário de publicação da edição | Depende do ritual do usuário: manhã (café), noite (wind-down) ou ambos |
| 3 | WhatsApp: canal de entrega ou só notificação? | WhatsApp não suporta cards visuais ricos — pode ser só "sua edição está pronta + link" |
| 4 | Experiência visual no email: cards ricos ou texto simples + link para o app? | Define onde o design concentra esforço no MVP |
| 5 | Onboarding explícito do Modo 2 ou descoberta natural? | Assumimos que o usuário vai clicar — precisa ser validado com dados reais |
| 6 | Normalização de título: visível (original vs. normalizado) ou silenciosa? | Impacta percepção de valor e confiança |
| 7 | Momento de coletar preferências iniciais: onboarding com perguntas ou inferência a partir do uso? | Define complexidade do onboarding e qualidade do primeiro feed |
