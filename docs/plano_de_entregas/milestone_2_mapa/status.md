# Status: Milestone 2 (Mapa e Bússola)

**Status:** Concluído ✅
**Data de Conclusão:** 30/06/2026

## O que foi feito:
1. **Integração do Mapa:** 
   - Leaflet e React-Leaflet configurados no Next.js (com desativação de SSR para o mapa).
   - Componente `MapComponent` criado com o tile claro `CARTO Light` garantindo o contraste estético exigido pelo app.
   - Lógica de centralização automática nas coordenadas mockadas do usuário inserida com sucesso.
   - Pontos/Spots inseridos no mapa dinamicamente consumindo dados reais do Supabase (tabela `spots`).
   - `react-leaflet-cluster` implementado para agrupar múltiplos marcadores próximos e evitar poluição visual.

2. **A Bússola e Motores de Sensor:**
   - Tela `CompassView.tsx` projetada com UI imersiva escura (fundo Dark, radares decorativos) que constrasta brilhantemente com o modo claro do mapa.
   - Conexão *Real* de Sensores: 
     - Hook do **DeviceOrientationEvent** implementado com suporte à requisição de permissão compulsória de dispositivos iOS 13+.
     - *Matemática de Correção:* Filtro Passa-Baixa (LPF) adicionado para remover tremores nativos dos hardwares Android/iOS; lógica de menor distância implantada para debugar o erro de Gimbal Lock de 360/0 graus nas animações CSS.
     - Geolocation API puxando variações de lat/lng simulando flutuações reais e ajustando a "Distância".

3. **Ambiente de Testes:**
   - Criação fluída de um túnel HTTPs com Cloudflare (`trycloudflare.com`) viabilizando a liberação de tráfego seguro (condição primária dos navegadores móveis para ceder o giroscópio) sem depender do IP na rede local.

## Próximos Passos (Milestone 3):
Criação do Fluxo de Spots (Adicionar novos lugares) com Firebase Storage (ou Storage local Supabase) para as fotos e refinamento das interações dos pins do mapa.
