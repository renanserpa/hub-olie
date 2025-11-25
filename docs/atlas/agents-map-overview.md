# Agents Map Overview – Visão dos Principais Agentes (v1)

> Este documento resume os principais agentes CORE e como eles se conectam.
> Serve como mapa rápido para o GOD user e como referência para os próprios agentes.

---

## 1. Principais Agentes CORE

### 1. Catalyst Agent (Master)

- **Papel:** transformar ideias em requisitos, arquitetura e planos de implementação.
- **Escopo:** global (multi-projeto).
- **Quando acionar:**
  - quando uma ideia estiver madura para virar módulo/sistema,
  - quando precisar redesenhar um fluxo existente,
  - quando quiser um plano em etapas.

### 2. GOD Ideas & Backlog Agent

- **Papel:** capturar, organizar e priorizar ideias.
- **Escopo:** global (mas consegue filtrar por projeto).
- **Quando acionar:**
  - para despejar ideias soltas,
  - para estruturar backlog,
  - para decidir o que está pronto para design (Catalyst).

### 3. Agents Architect & Orchestrator (God of Agents)

- **Papel:** arquiteto-chefe de agentes.
- **Escopo:** global.
- **Quando acionar:**
  - quando você tiver ideia de novo agente,
  - quando quiser saber quais agentes usar em um novo projeto,
  - quando o catálogo de agentes estiver confuso e precisar de limpeza/organização.

### 4. Core Code Assistant

- **Papel:** implementar código e refactors com base em planos já definidos.
- **Escopo:** global (podendo ter versões por projeto).
- **Quando acionar:**
  - quando já houver plano do Catalyst,
  - quando precisar implementar ou refatorar módulos,
  - quando for integrar com Supabase/APIs.

### 5. Docs & Knowledge Agent (conceitual v1)

- **Papel:** transformar decisões e código em documentação organizada.
- **Escopo:** global, com seções por projeto.
- **Quando acionar:**
  - após decisões arquiteturais importantes,
  - após implementações significativas,
  - para criar/atualizar README, overviews, ADRs simples.

### 6. Ops & Analytics Agent (conceitual v1)

- **Papel:** analisar dados de operação e apontar problemas/oportunidades.
- **Escopo:** por projeto (monitorando sistemas específicos).
- **Quando acionar:**
  - quando houver métricas, logs, erros,
  - quando quiser insights sobre performance ou uso.

### 7. Creative Experience Agent (conceitual v1)

- **Papel:** desenhar experiências criativas (UI/UX, conteúdo, roteiros).
- **Escopo:** global, com especializações por projeto.
- **Quando acionar:**
  - para criar ou melhorar telas,
  - para materiais de apresentação,
  - para campanhas, posts, roteiros de vídeo.

---

## 2. Diagrama Textual Simplificado

```text
                 [GOD User]
                     |
                     v
         +--------------------------+
         |      GOD Ideas Agent     |
         |   (ideias & backlog)     |
         +--------------------------+
                     |
          ideias maduras / priorizadas
                     v
         +--------------------------+
         |      Catalyst Agent      |
         | (arquitetura & planos)   |
         +--------------------------+
                     |
           requisitos / planos
                     v
         +--------------------------+
         |    Core Code Assistant   |
         |  (implementação & ref)   |
         +--------------------------+
                     |
               código / mudanças
                     v
         +--------------------------+
         |   Docs & Knowledge Agent |
         |     (docs & decisões)    |
         +--------------------------+
                     |
                docs atualizadas
                     v
         +--------------------------+
         |    Ops & Analytics Agent |
         |  (dados & insights)      |
         +--------------------------+
                     |
      problemas / oportunidades / ideias
                     v
         +--------------------------+
         |      GOD Ideas Agent     |
         +--------------------------+

Paralelamente:
- Sempre que uma ideia envolver AGENTES em si:
  GOD Ideas → Agents Architect & Orchestrator → novos/evoluídos agentes.
- Sempre que for necessário algo visual/marketing/experiência:
  Catalyst / GOD / Code → Creative Experience Agent → materiais & UX.
```

---

## 3. Quem chama quem (resumo)

- **GOD user → GOD Ideas Agent**  
  sempre que surgir algo novo (ideias, problemas, oportunidades).

- **GOD Ideas Agent → Catalyst Agent**  
  quando uma ideia estiver pronta para design/arquitetura.

- **GOD Ideas Agent → Agents Architect**  
  quando a ideia for sobre criar/evoluir agentes.

- **Catalyst Agent → Core Code Assistant**  
  quando já houver plano para ser implementado.

- **Core Code Assistant → Docs Agent**  
  quando uma implementação significativa for concluída.

- **Ops & Analytics Agent → GOD Ideas Agent**  
  quando descobrir problemas/oportunidades na operação.

- **GOD user / Catalyst / Code → Creative Agent**  
  quando precisar de UX, materiais, mensagens, storytelling.

---

## 4. Mapa por Fase do Lifecycle

Voltando ao `project-lifecycle.md`, podemos mapear:

- Fase 0–1 (Insight & Ideias)
  - **Principal:** GOD Ideas Agent
  - Apoio: GOD user, Ops (quando houver dados)

- Fase 2 (Design & Arquitetura)
  - **Principal:** Catalyst Agent (ou Project Catalyst)
  - Apoio: Agents Architect (se envolver novos agentes), Creative Agent (UX), GOD user

- Fase 3 (Planejamento)
  - **Principal:** GOD user + GOD Ideas
  - Apoio: Catalyst, Code Assistant

- Fase 4 (Implementação)
  - **Principal:** Core Code Assistant (e variações)
  - Apoio: Catalyst, Docs Agent

- Fase 5 (Documentação)
  - **Principal:** Docs & Knowledge Agent
  - Apoio: Catalyst, Code

- Fase 6–7 (Operação & Insights)
  - **Principal:** Ops & Analytics Agent
  - Apoio: GOD Ideas, GOD user

- Fase 8 (Evolução)
  - **Principal:** GOD Ideas Agent
  - Apoio: Catalyst, Agents Architect, Ops & Analytics

---

## 5. Como este mapa deve ser usado

- Como **referência rápida**: quando estiver em dúvida sobre qual agente chamar.
- Como base para **telas futuras** do Agents Hub (um “org chart” de agentes).
- Como entrada para o **Agents Architect**, quando for:
  - criar novos agentes,
  - ou reorganizar o catálogo.

Se novos agentes CORE surgirem no futuro, este mapa deve ser atualizado
para manter uma visão clara do “time titular” do ecossistema.
