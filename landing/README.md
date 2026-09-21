# ORVION — Presença digital

## Arquitetura e publicação

Fonte: `guiizao14/orvion`, diretório `landing/`. Dashboard React original em `/`;
landing independente em `/landing/`. `vite.config.js` agora inclui ambas no build.
Não foram alterados componentes do dashboard, cliente Supabase, SQL ou workflows n8n.
O antigo anúncio de FAQ em `landing/index.html` foi substituído; documentos comerciais
históricos foram preservados e não são parte do site publicado.

O site existente `https://orvion-landing.netlify.app` está conectado ao repositório
`guiizao14/orvion-landing`, branch `main`, projeto Netlify
`f9227832-c816-42c9-8973-04403694a7c1`. Esse repositório recebe a exportação estática.
Nenhum projeto, domínio, banco, login, função ou plano pago foi criado.

Execute `pnpm build:landing` para exportar `dist/landing-site/`. Sincronize seu conteúdo
com a raiz do repositório de publicação e faça commit/push. Não copie `dist/index.html`:
ele é o dashboard. A exportação inclui só HTML, CSS, JavaScript, fontes e SVGs da landing.
Preserve a configuração e o histórico do repositório de publicação.

## Identidade e motion

`public/brand/` contém logo clara/escura/monocromática, símbolo nas mesmas variantes,
favicon e símbolo animado. Todos são vetores transparentes; não contêm PNG/base64.
Contornos e espaçamento foram reconstruídos a partir de `logo_orvion.png` e
`tipografia_orvion.png` fornecidos pelo proprietário. O acento foi alinhado a `#FF5A5F`.
O wordmark está em paths e não depende da fonte do dispositivo. Manrope é usada apenas
nos textos da página e servida localmente com `font-display: swap`.

Regeneração opcional: `python scripts/vectorize-brand.py <pasta-das-referencias>`
(Pillow/numpy), depois `node scripts/animate-brand.mjs`. Os PNGs de referência não
são necessários para compilar ou publicar; os SVGs já estão versionados.

Entrada do símbolo: 1,6 s, desenhando os próprios contornos. Fluxo do sistema: 5,4 s,
sem áudio, giro ou vídeo. CSS e IntersectionObserver controlam entrada/reentrada
no scroll. Movimento reduzido deixa conteúdo e composição estáticos. Sem JavaScript,
conteúdo, WhatsApp e expansíveis nativos continuam disponíveis.

Referências consultadas e adaptadas, sem copiar identidade ou componentes:

- [awesome-design-md](https://github.com/VoltAgent/awesome-design-md), especialmente
  [Sanity DESIGN.md](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/sanity/DESIGN.md):
  hierarquia tipográfica, contraste de escala, superfícies escuras e acento contido.
- [taste-skill](https://github.com/Leonxlnx/taste-skill): composição orientada ao brief,
  hierarquia, espaço negativo, estados completos e prevenção de padrões genéricos.
  As instruções explícitas da ORVION prevalecem sobre sugestões genéricas dessas referências.

## Conteúdo e contato

WhatsApp único: `https://wa.me/5527999408858`. As mensagens são centralizadas em
`landing/main.js`, com link funcional direto como fallback no HTML. Sem depoimentos,
cases, resultados, preços ou Instagram não confirmados. O visitante é convidado
para uma conversa de diagnóstico, sem precisar escolher previamente um serviço.

## Validação em 21/09/2026

Build Vite de produção concluído. Testes `scripts/qa.mjs` em Chromium:

| Viewport | Rolagem horizontal | CTA na primeira tela | Axe WCAG A/AA |
| --- | --- | --- | --- |
| 1440 × 900 | Ausente | Sim | 0 violações detectadas |
| 1280 × 800 | Ausente | Sim | 0 violações detectadas |
| 768 × 1024 | Ausente | Sim | 0 violações detectadas |
| 390 × 844 | Ausente | Sim | 0 violações detectadas |
| 375 × 812 | Ausente | Sim | 0 violações detectadas |

Menu mobile, Escape, links internos, teclado Enter/Espaço nos expansíveis,
seleção exclusiva/desmarcação, esmaecimento reversível, foco, hover, scroll em ambos
os sentidos, movimento reduzido, console e recursos HTTP verificados. Capturas
desktop/mobile e versões da marca inspecionadas visualmente. Sem JavaScript também testado.
Dashboard validado em 1440 e 390 px: seleção, busca e captura de lead.

Limites: dashboard testado em modo demonstração, sem credenciais de produção;
integrações reais Supabase/n8n não foram acionadas. A emulação mobile em Chromium
não substitui testes em aparelhos físicos ou nos navegadores internos de Instagram/Facebook.
Auditoria automática não certifica acessibilidade completa. Links WhatsApp foram
verificados sem enviar mensagens.
