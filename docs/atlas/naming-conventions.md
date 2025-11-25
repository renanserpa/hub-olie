# Naming Conventions – Projects, Agents, Files & Knowledge

> Este documento define convenções de nomes para manter o ecossistema organizado,
> facilitar reuso entre projetos e ajudar agentes a criarem coisas de forma consistente.

---

## 1. Projetos

### 1.1. Slug de Projeto

- Formato: `kebab-case`
- Exemplo:
  - `agents-hub`
  - `oliehub`
  - `marketing-portal`
  - `atelier-ops`

`slug` deve ser curto, descritivo e estável ao longo do tempo.

### 1.2. Nome Amigável

- Pode ter espaços e letras maiúsculas.
- Exemplos:
  - “Agents Hub”
  - “OlieHub Ops Platform”
  - “Portal de Marketing”

---

## 2. Agentes

### 2.1. ID lógico de agente (`agent_key`)

- Formato: `kebab-case` com sufixo `-agent` quando fizer sentido.
- Exemplo:
  - `catalyst-agent`
  - `god-ideas-agent`
  - `core-code-assistant`
  - `agents-architect-agent`
  - `creative-experience-agent`

### 2.2. Agentes específicos de projeto

- Formato sugerido: `<project-slug>-<role>-agent`
- Exemplos:
  - `oliehub-catalyst-agent`
  - `oliehub-code-assistant`
  - `agents-hub-catalyst-agent`

Quando fizer sentido, o agente específico de projeto deve ter um campo `base_agent_id`
apontando para o agente CORE do qual ele deriva.

### 2.3. Nome exibido

- Formato mais humano, ex.:
  - “Catalyst Agent”
  - “GOD Ideas & Backlog Agent”
  - “OlieHub Code Assistant”

---

## 3. Arquivos de Knowledge

### 3.1. Estrutura básica

Sugestão de organização:

```text
knowledge/
  stack-links.md
  prompt-kits.md
  ecosystem-glossary.md
  project-lifecycle.md
  naming-conventions.md
  interaction-guidelines.md
  knowledge-architecture.md
  agents-hub-overview.md
  agents-hub-data-model-conceptual.md
  agents-core.md
  ...

  agents/
    catalyst-agent.md
    god-ideas-agent.md
    core-code-assistant.md
    agents-architect-agent.md
    ...

  projects/
    <project-slug>/
      <project-slug>-overview.md
      <project-slug>-architecture.md
      <project-slug>-status-roadmap.md
      domain/
        ... (arquivos de domínio)
      agents/
        <project-slug>-catalyst-agent.md
        <project-slug>-code-assistant.md
        ... (outros)
      prompts/
        <project-slug>-specific-prompts.md
```

### 3.2. Padrão de nomes para arquivos

- Visão geral de um projeto:
  - `<project-slug>-overview.md`
- Arquitetura de um projeto:
  - `<project-slug>-architecture.md`
- Roadmap / status de um projeto:
  - `<project-slug>-status-roadmap.md`

- Arquivo de domínio:
  - `atelier-manufacturing-overview.md`
  - `sewing-machines-basics.md`
  - `embroidery-machines-basics.md`

- Blueprint de agente:
  - `<agent-key>.md`
  - Ex.: `catalyst-agent.md`, `god-ideas-agent.md`, `core-code-assistant.md`

- Playbooks:
  - `playbooks-new-project.md`
  - `playbooks-new-module.md`
  - `playbooks-new-agent.md`

---

## 4. Código (visão geral)

Cada projeto pode ter suas particularidades, mas recomenda-se um padrão geral:

### 4.1. Pastas principais (frontend React/Vite)

- `src/components/` – componentes de UI.
- `src/pages/` – páginas/rotas da aplicação.
- `src/hooks/` – hooks reutilizáveis.
- `src/contexts/` – contexts (React Context API).
- `src/services/` – chamadas a APIs, lógica de integração (Supabase, HTTP, etc.).
- `src/lib/` – helpers, clientes (ex.: `supabaseClient`).
- `src/types/` – tipos TypeScript compartilhados.
- `src/styles/` – estilos globais, se necessário.

### 4.2. Nomes de componentes React

- PascalCase para componentes:
  - `MainLayout`, `LoginPage`, `ProjectList`, `IdeaBoard`.
- arquivos `.tsx` com o mesmo nome do componente principal.

### 4.3. Nomes de hooks

- `use<Nome>` em camelCase:
  - `useProjects`, `useIdeas`, `useAuth`, `useSupabaseClient`.

### 4.4. Nomes de serviços

- `*Service.ts` ou nomes específicos claros:
  - `projectService.ts`, `ideaService.ts`, `authService.ts`.

---

## 5. Banco de Dados (conceitual)

Embora o SQL possa variar, alguns padrões de nomes ajudam:

- Tabelas em `snake_case`:
  - `projects`, `agents`, `agent_versions`, `ideas`, `conversations`.
- Colunas:
  - `created_at`, `updated_at` para timestamps,
  - `project_id`, `agent_id`, etc. para FKs,
  - enums textuais simples para `status`, `type` etc.

---

## 6. Como os agentes devem usar estas convenções

### 6.1. Catalyst Agent

- Ao propor novos módulos/arquivos:
  - usar convenções de nomes sugeridas aqui,
  - sugerir paths alinhados (`src/hooks/useX`, `knowledge/projects/<slug>/...`).

### 6.2. Core Code Assistant

- Ao criar arquivos de código:
  - seguir convenções de pasta e nomes,
  - evitar criar múltiplos estilos misturados.

### 6.3. Docs & Knowledge Agent

- Ao criar novos arquivos de conhecimento:
  - usar prefixos claros,
  - seguir a estrutura `knowledge/`,
  - evitar nomes genéricos como `anotacoes.md`.

### 6.4. Agents Architect

- Ao gerar novos blueprints:
  - respeitar a convenção de IDs (`agent_key`),
  - salvar como `<agent-key>.md`,
  - apontar no cadastro lógico (`agents.agent_key`).

---

## 7. Ajustes e Evolução

Estas convenções podem evoluir, mas:
- mudanças devem ser raras,
- e idealmente registradas em um ADR (decisão) simples.

Sempre que uma convenção mudar:
- atualizar este documento,
- informar os agentes (por exemplo, via comentário em uma conversa),
- ajustar futuras criações para seguirem o padrão novo.
