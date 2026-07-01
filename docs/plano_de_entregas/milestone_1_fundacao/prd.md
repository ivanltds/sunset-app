# Milestone 1: Fundação do App e Lazy Login (O Chassi)

## 1. Visão Geral
O objetivo deste milestone é criar a base da infraestrutura do Sunset App. Como a proposta de valor exige zero fricção para testar o aplicativo e o usuário final utilizará a câmera e geolocalização no celular, as bases tecnológicas de funcionamento nativo na web (PWA) e do sistema de Contas Fantasma devem ser sólidas.

## 2. Requisitos de Negócio (Regras)
- **R1 - Setup Base:** O projeto deve ser rodado em Next.js (App Router), utilizando Tailwind CSS com suporte total e primário a Dark Mode.
- **R2 - PWA (Progressive Web App):** A aplicação web deve configurar um manifest `next-pwa` válido para permitir a instalação do app diretamente via Chrome/Safari em Android/iOS sem passar pela loja de aplicativos oficial.
- **R3 - Autenticação e Onboarding (Foco em Conversão):**
  - **Lazy Login (Supabase Anonymous Auth)**: Zero fricção. O usuário não precisa criar conta. O Supabase gera uma conta fantasma anônima nativamente e retorna um JWT seguro.
  - **Sessão Persistente**: A sessão anônima fica armazenada com segurança pelo SDK do Supabase. A identidade real (Apple/Google) pode ser mesclada depois sem perder os dados.
  - **Onboarding Geográfico**: O app pedirá permissão de localização no primeiro uso. Se negado, o mapa abrirá focado em uma área de destaque (ex: São Paulo).
- **R4 - Escalabilidade no Banco de Dados:** O banco Supabase precisa estar integrado e com as tabelas de `users` criadas para comportar tanto Contas Fantasmas (anônimas) quanto usuários logados via OAuth (quando habilitarmos depois).

## 3. Fora do Escopo (Não Fazer Agora)
- Mapa e pinos (Fica para o Milestone 2).
- Upload de imagens (Fica para o Milestone 3).
- Login via Google/Apple (Faremos o mock do login fantasma apenas).
