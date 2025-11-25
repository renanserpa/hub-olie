# Tech Stack & Docs – OlieHub & Agents Hub

Este arquivo lista tecnologias que usamos hoje e outras que fazem sentido estratégico para o ecossistema:
- OlieHub (ERP / Ops Platform)
- Hub de Projetos, Agentes e Ideias
- Agentes técnicos (código, dados, infra)
- Agentes criativos (design, conteúdo, mídia)

Use este arquivo como mapa de referência rápida para documentação oficial.

---

## 1. Plataforma Core de Dados & Backend

### Supabase

**Papel:** Backend principal (Postgres, Auth, Realtime, Storage, Edge Functions) para OlieHub e, possivelmente, para o Hub de Agentes/Projetos.

- Site: https://supabase.com/
- Docs gerais: https://supabase.com/docs
- Database / Postgres: https://supabase.com/database
- Auth: https://supabase.com/docs/guides/auth
- Realtime: https://supabase.com/docs/guides/realtime
- Storage: https://supabase.com/docs/guides/storage
- Edge Functions: https://supabase.com/docs/guides/functions

### Node.js

**Papel:** Runtime JavaScript/TypeScript para scripts, funções backend, ferramentas de automação e CLIs.

- Docs: https://nodejs.org/api/

### GitHub

**Papel:** Repositórios de código, issues, PRs, CI/CD, gatilho para Code Assistants.

- REST API docs: https://docs.github.com/en/rest
- Conteúdo de repositórios (arquivos, diretórios): https://developer.github.com/v3/repos/contents/

### Vercel

**Papel:** Deploy de frontends (React/Vite/Next), edge functions, hospedagem dos apps web e possivelmente endpoints de agentes.

- Docs gerais: https://vercel.com/docs

---

## 2. Frontend & UI

### React

**Papel:** Biblioteca principal de UI para OlieHub, Hub de Agentes e futuros apps (painéis, CRMs, etc.).

- Site / Docs: https://react.dev/
- Quick Start (moderno): https://react.dev/learn

### Vite

**Papel:** Ferramenta de build/dev para os frontends (especialmente React + TS).

- Site / Docs: https://vite.dev/

### Tailwind CSS

**Papel:** Design system utilitário (base do AtlasUI), acelera layout responsivo e estilização de painéis complexos.

- Site / Docs: https://tailwindcss.com/
- Guia (incluindo Vite): https://tailwindcss.com/docs

### React Native & Expo (futuro mobile)

**Papel:** Opção para apps mobile nativos (operacional, dashboards, etc.), compartilhando lógica com o stack React.

- React Native docs: https://reactnative.dev/docs/getting-started
- React Native tutorial: https://reactnative.dev/docs/tutorial
- Expo docs: https://docs.expo.dev/
- Expo platform: https://expo.dev/

---

## 3. AI / LLMs / Agentes

### Google AI / Gemini

**Papel:** Modelos de linguagem principais para agentes (código, análise, criativos), via Google AI Studio e Gemini API.

- Gemini API docs (geral): https://ai.google.dev/gemini-api/docs
- API reference: https://ai.google.dev/api
- AI Studio Quickstart: https://ai.google.dev/gemini-api/docs/ai-studio-quickstart
- Gemini Cookbook (exemplos): https://github.com/google-gemini/cookbook

### OpenAI (ChatGPT / API) – complementar

**Papel:** Alternativa e complemento de LLMs (para testes, comparação de agentes, ou integração específica).

- Portal docs: https://platform.openai.com/docs
- API reference: https://platform.openai.com/docs/api-reference/introduction

### Vercel AI SDK (futuro)

**Papel:** Framework para integrar LLMs (Gemini, OpenAI, etc.) em apps React/Next/Vite com streaming, tools, RAG, etc.

- Docs: https://ai-sdk.dev/docs/introduction

---

## 4. Mensageria, Social & Omnichannel

### WhatsApp Business / Cloud API (Meta)

**Papel:** Integração com WhatsApp para comunicação com clientes (pedidos, suporte, automações alinhadas à política atual da plataforma).

- Visão geral da plataforma: https://developers.facebook.com/docs/whatsapp/
- Cloud API (principal): https://developers.facebook.com/docs/whatsapp/cloud-api/
- Developer Hub: https://business.whatsapp.com/developers/developer-hub

*(Importante: seguir sempre as políticas atuais da Meta para uso da API, especialmente quanto a chatbots e finalidades permitidas.)*

### Instagram APIs (Meta)

**Papel:** Integrações de marketing, ingestão de mensagens/comentários, insights de campanhas, etc.

- Visão geral de APIs: https://developers.facebook.com/products/instagram/apis/
- Instagram Graph API main: https://developers.facebook.com/docs/instagram-platform/
- API Reference: https://developers.facebook.com/docs/instagram-platform/reference/

### Facebook Graph / Meta for Developers (base)

**Papel:** Base para várias integrações (Instagram, WhatsApp, páginas e assets).

- Meta for Developers: https://developers.facebook.com/

---

## 5. Pagamentos & Financeiro

### Stripe

**Papel:** Gateway de pagamento internacional, assinaturas, billing, customer portal (para SaaS, produtos digitais, etc.).

- Docs gerais: https://docs.stripe.com/
- API reference: https://docs.stripe.com/api

### Asaas (Brasil)

**Papel:** Cobrança recorrente, boletos, PIX, gestão de recebíveis para contexto brasileiro.

- Docs API: https://docs.asaas.com/
- Portal desenvolvedores: https://www.asaas.com/desenvolvedores

---

## 6. ERPs Fiscais & Gestão Integrada (Brasil)

### Bling

**Papel:** ERP/fiscal para integração com nota fiscal, estoque, vendas; possível integração com OlieHub para emissão e conciliação.

- Portal dev: https://developer.bling.com.br/
- API pública: https://www.bling.com.br/api-bling

### Tiny ERP

**Papel:** ERP integrado para vendas, estoque, expedição e emissão de NFe, com API REST para sincronia com OlieHub.

- Docs API (geral): https://tiny.com.br/api-docs/api
- Exemplo API v2.0 (expedições): https://tiny.com.br/api-docs/api2-expedicao-obter

---

## 7. Logística & Fretes

### Melhor Envio

**Papel:** Cotações e geração de fretes com múltiplas transportadoras (Brasil), integrado ao fluxo de pedidos do OlieHub.

- Portal docs: https://docs.melhorenvio.com.br/
- Introdução API: https://docs.melhorenvio.com.br/reference/introducao-api-melhor-envio
- Introdução (alternativa): https://docs.melhorenvio.com.br/docs/introducao-a-api

---

## 8. Automação & Orquestração Externa

### n8n

**Papel:** Plataforma de automação de workflows com integrações e nós de AI, útil para conectar OlieHub/Hub a serviços externos sem codar tudo na mão.

- Docs: https://docs.n8n.io/

### Make (antigo Integromat)

**Papel:** Automação visual de processos (integração com CRMs, ERPs, planilhas, etc.).

- Site / Docs principais: https://www.make.com/

### Zapier

**Papel:** Integrações no-code com milhares de apps; útil para disponibilizar “gatilhos” do hub e do OlieHub para usuários finais ou parceiros.

- Developer platform docs: https://zapier.com/developer-platform
- Docs gerais de plataforma: https://developer.zapier.com/

---

## 9. Design, UX, Branding & Conteúdo Criativo

### Figma

**Papel:** Ferramenta central de design de interface, fluxos e prototipagem, cada vez mais integrada com AI e agentes.

- Help Center (PT): https://help.figma.com/hc/pt-br
- Figma Learn / cursos: https://help.figma.com/hc/en-us
- Developer Docs (plugins, APIs): https://developers.figma.com/

### Canva

**Papel:** Criação de materiais de marketing, catálogos, posts, apresentações; potencial integração via Apps SDK e Connect APIs.

- Canva Developers (geral): https://www.canva.com/developers/
- Apps SDK docs: https://www.canva.dev/
- Connect APIs: https://www.canva.dev/docs/connect/
- Data Connectors: https://www.canva.com/developers/build-with-data-connectors/

*(Interessante para agentes criativos gerarem templates, artes e variações.)*

---

## 10. Observabilidade, Logs & Monitoramento

### Sentry

**Papel:** Monitoramento de erros e performance para frontends e backends (React, Node, etc.), importante para OlieHub em produção.

- Docs gerais: https://docs.sentry.io/
- JavaScript SDK: https://docs.sentry.io/platforms/javascript/
- JS SDK repo: https://github.com/getsentry/sentry-javascript

### (Futuro) Logging/Monitoring em Cloud

**Papel:** Uso de ferramentas de logging (por exemplo, Google Cloud Logging, Logtail, etc.) para acompanhar agents, funções e webhooks.

- Google Cloud Operations (Logging/Monitoring) – ponto de partida:
  - https://cloud.google.com/products/operations

---

## 11. Outros Recursos Relevantes

### Templates & Docs Sites

**Papel:** Documentar o ecossistema (apps, agentes, APIs) de forma organizada.

- Nextra Docs Template (Next.js + Vercel): https://vercel.com/templates/next.js/documentation-starter-kit

### Comunidades & Exemplos

- n8n Workflows (exemplos): https://n8n.io/workflows/
- Supabase Examples: https://supabase.com/examples
- Stripe Samples: https://docs.stripe.com/samples

---

## 12. Como usar este arquivo no projeto

Sugestões de uso:

- Manter este arquivo em algo como `docs/stack-links.md` ou `knowledge/stack-links.md`.
- Sempre que uma nova tecnologia entrar no ecossistema (ex.: novo gateway de pagamento, nova API de logística, novo provedor de AI), adicionar:
  - uma breve descrição do papel dela no OlieHub / Hub de Agentes,
  - links principais de documentação.
- Em conversas com agentes (Catalyst, Code Assistant, etc.), referenciar explicitamente:
  - “Conforme stack-links.md, nosso stack de AI hoje é X, Y, Z…”
- Usar este documento como base para painéis internos de “Arquitetura & Stack”.
