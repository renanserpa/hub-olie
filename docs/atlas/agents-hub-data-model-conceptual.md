# Agents Hub – Modelo de Dados Conceitual (v1)

> Este documento descreve o modelo de dados **conceitual** do Agents Hub.  
> Não é SQL definitivo, e sim um mapa de entidades, relações e intenções.
> O objetivo é servir de base para:
> - o Catalyst Agent projetar features,
> - o Core Code Assistant gerar código,
> - e o GOD user visualizar o “esqueleto” do hub.

---

## 1. Visão Geral

O Agents Hub gerencia quatro eixos principais:

1. **Projetos** – coisas que queremos construir ou já existem (sistemas, produtos, apps).
2. **Agentes** – agentes de IA e suas versões (CORE + específicos por projeto).
3. **Ideias / Backlog** – ideias, iniciativas, melhorias, experimentos.
4. **Conversas / Contextos** – pontos de contexto importantes (anotações, decisões, links para chats).

Além disso, no futuro podem existir:

- **Tasks / Work Items** – tarefas derivadas das ideias,
- **Links Externos** – conexões com GitHub, Notion, etc.,
- **Users / Roles** – GOD user, colaboradores, etc.

Por enquanto, focamos no **núcleo mínimo**: `projects`, `agents`, `agent_versions`, `ideas`, `conversations`.

---

## 2. Entidade: Project

Representa um projeto/sistema/produto dentro do Hub.

### Conceito

- Um **Project** pode ser:
  - um sistema como o OlieHub,
  - um site,
  - um app mobile,
  - um jogo,
  - um “produto interno” (ex.: plataforma de relatórios),
  - ou até um “meta projeto” (como o próprio Agents Hub).

### Campos (conceituais)

- `id` – identificador único (UUID).
- `name` – nome do projeto (ex.: “OlieHub”, “Agents Hub”).
- `slug` – identificador amigável (ex.: `oliehub`, `agents-hub`).
- `description` – descrição curta/longa do projeto.
- `status` – estágio (ex.: `idea`, `discovery`, `planning`, `active`, `on_hold`, `archived`).
- `type` – tipo de projeto (ex.: `product`, `internal_tool`, `experiment`, `content`).
- `stack_summary` – texto livre/JSON com resumo da stack principal (ex.: “React + Supabase + Vercel”).  
- `created_at` / `updated_at` – timestamps.
- `owner_id` (opcional) – referência ao usuário/GOD responsable (futuro).

### Relações principais

- Um **Project** pode ter muitas **Ideas** ligadas a ele.
- Um **Project** pode ter muitos **Agents** (especializações dos agents core).
- Um **Project** pode ter muitas **Conversations** relevantes (decisões, discussões).

---

## 3. Entidade: Agent

Representa um agente (template ou especializado) registrado no Hub.

### Conceito

- Um **Agent** pode ser:
  - um agente CORE (global),
  - uma especialização por projeto (ex.: `oliehub-code-assistant`),
  - um agente criativo específico,
  - um agente de ops, suporte, etc.

### Campos (conceituais)

- `id` – identificador único (UUID).
- `agent_key` – identificador lógico/slug (ex.: `catalyst-agent`, `god-ideas-agent`, `core-code-assistant`, `oliehub-code-assistant`).
- `name` – nome exibido (ex.: “Catalyst Agent”, “OlieHub Code Assistant”).
- `scope` – escopo lógico:
  - `global` (template),
  - `project` (ligado a um projeto específico),
  - `experimental`.
- `project_id` (nullable) – referência a `Project` quando for específico de um projeto.
- `base_agent_id` (nullable) – referência a outro `Agent` quando este for derivado (ex.: OlieHub Code Assistant derivado do Core Code Assistant).
- `role` – descrição textual do papel principal.
- `status` – `active`, `experimental`, `deprecated`.
- `tags` – lista de tags (ex.: `code`, `ideas`, `ops`, `creative`).
- `current_version_id` (nullable) – referência para a versão atual (na tabela `agent_versions`).
- `created_at` / `updated_at`.

### Relações principais

- Um **Agent** pode ter várias **AgentVersions** (histórico).
- Um **Agent** pode estar ligado a um **Project** (quando específico).
- Um **Agent** pode estar relacionado a muitas **Ideas** (ideias que pedem alteração/criação desse agente).

---

## 4. Entidade: AgentVersion

Representa uma versão específica do blueprint de um agente.

### Conceito

- Cada vez que redesenhamos um agente (mudança de escopo, role, tools, etc.), criamos uma nova **AgentVersion**.
- Isso facilita histórico e comparação entre versões.

### Campos (conceituais)

- `id` – identificador único (UUID).
- `agent_id` – referência ao `Agent` ao qual pertence.
- `version_label` – string de versão (ex.: `1.0.0`, `1.1.0`, `2.0.0`).
- `changelog` – resumo das mudanças desta versão (texto).
- `blueprint_md_url` ou `blueprint_ref` – referência para o arquivo `.md` do blueprint (pode ser URL, path lógico, ou storage key).
- `created_at` – quando foi criada.
- `created_by` (opcional) – quem criou (GOD user, outro).

### Relações principais

- Pertence a um **Agent** (N:1).
- Pode ser referenciada por **Ideas** que sugerem evoluções daquele agente.

---

## 5. Entidade: Idea

Representa qualquer ideia / melhoria / iniciativa em potencial.

### Conceito

- É a unidade básica de pensamento no backlog:
  - pode ser uma feature,
  - uma melhoria de UX,
  - uma correção/refactor,
  - um novo agente,
  - um experimento,
  - um conteúdo (site, material, campanha).

### Campos (conceituais)

- `id` – identificador único (UUID).
- `title` – título curto e claro (ex.: “Agente de Design para OlieHub”).
- `description` – descrição detalhada da ideia.
- `type` – categoria (ex.: `feature`, `improvement`, `refactor`, `agent`, `experiment`, `content`, `ops`).
- `project_id` (nullable) – referência a `Project` (ou null se for global).
- `related_agent_id` (nullable) – referência a `Agent`, se a ideia for sobre um agente específico.
- `status` – estágio da ideia:
  - `draft`,
  - `triage`,
  - `ready_for_design`,
  - `in_design`,
  - `ready_for_implementation`,
  - `in_progress`,
  - `done`,
  - `discarded`.
- `impact_estimate` (nullable) – texto ou enum simples (ex.: `low`, `medium`, `high`, `very_high`).
- `effort_estimate` (nullable) – texto ou enum simples (ex.: `xs`, `s`, `m`, `l`, `xl`).
- `priority_hint` (nullable) – campo livre ou enum.
- `origin` – origem da ideia (ex.: `god_user`, `ops_agent`, `support`, `user_feedback`, `experiment`).
- `source_reference` (nullable) – link ou ID para conversa/documento onde a ideia surgiu.
- `tags` – lista de tags (módulos, tecnologias, temas).
- `created_at` / `updated_at`.
- `created_by` (opcional) – quem criou.

### Relações principais

- Uma **Idea** pode estar ligada a um **Project** (ou não).
- Pode estar ligada a um **Agent** (ideia sobre design/ajuste de agente).
- Pode ter relação com uma ou mais **Conversations** (discussões onde foi falada).
- Pode, no futuro, ser ligada a **Tasks** e **Issues** externas (GitHub, Jira, etc.).

---

## 6. Entidade: Conversation

Representa um contexto de conversa ou decisão relevante.

### Conceito

- Não precisa ser uma transcrição completa.
- Pode ser um “bloco de contexto” com:
  - resumo da conversa,
  - links para chats externos (ChatGPT, Gemini, etc.),
  - decisões tomadas,
  - próximos passos.

### Campos (conceituais)

- `id` – identificador único (UUID).
- `project_id` (nullable) – referência a `Project` (se a conversa for sobre um projeto específico).
- `title` – título (ex.: “Discussão inicial sobre o Agents Hub”).
- `summary` – resumo das decisões e pontos importantes.
- `source_type` – ex.: `chatgpt`, `gemini`, `meeting`, `doc`.
- `source_link` (nullable) – link externo (ex.: URL de conversa, doc, reunião).
- `related_idea_ids` (opcional, lista) – referência a ideas que surgiram ali (pode ser modelado via tabela de junção).
- `created_at` / `updated_at`.
- `created_by` (opcional).

### Relações principais

- Uma **Conversation** pode estar ligada a um **Project**.
- Pode estar ligada a várias **Ideas** (N:N).
- Serve como “âncora de contexto” para entender de onde surgiram decisões e backlog.

---

## 7. Relações Resumidas

- **Project 1:N Ideas**
- **Project 1:N Agents**
- **Agent 1:N AgentVersions**
- **Agent 1:N Ideas** (quando a ideia é sobre um agente)
- **Project 1:N Conversations**
- **Conversation N:N Ideas** (via tabela de junção `conversation_ideas`)

### Tabelas auxiliares sugeridas (conceituais)

- `conversation_ideas`
  - `conversation_id`
  - `idea_id`

No futuro (não obrigatório na v1):

- `tasks` – tarefas derivadas de ideias.
- `external_links` – links para GitHub issues, PRs, etc.
- `users` / `members` – pessoas que interagem com o hub.

---

## 8. Cenários de Uso Típicos

### 8.1. Cadastrar um novo projeto

1. Criar registro em `projects` com nome, descrição, stack, status.
2. Criar agentes específicos derivados do CORE (ex.: `oliehub-code-assistant`) em `agents`.
3. Registrar a conversa de inception em `conversations`.

### 8.2. Registrar uma ideia nova

1. Criar `idea` com título, descrição, tipo, origem.
2. Se já tiver projeto: preencher `project_id`.
3. Se for sobre um agente: preencher `related_agent_id`.

### 8.3. Evoluir uma ideia para “pronta para design”

1. Atualizar `status` da `idea` para `ready_for_design`.
2. O GOD Ideas Agent pode sugerir encaminhar ao Catalyst.

### 8.4. Versionar um agente

1. Criar novo registro em `agent_versions` com referência ao `agent_id` e `version_label`.
2. Atualizar `agents.current_version_id` para apontar para a nova versão.

---

## 9. Próximos Passos

1. O Catalyst Agent pode:
   - propor ajustes nesse modelo conceitual conforme surgirem necessidades,
   - ajudar a priorizar quais entidades/tabelas entrarão na v1 do banco (Supabase).

2. Quando formos para o nível SQL:
   - mapear essas entidades para tabelas concretas,
   - decidir tipos de dados,
   - definir RLS (quando for o momento),
   - criar views/relatórios necessários.

3. Integrar isso com os blueprints de agentes CORE:
   - GOD Ideas Agent trabalhando com `ideas`,
   - Catalyst Agent com `projects`, `agents`, `ideas`,
   - Core Code Assistant com o que for definido como parte do código do Agents Hub.

---
