# Ecosystem Glossary – Agents Hub & Projects

> Glossário de termos que usamos no ecossistema de agentes, projetos e sistemas.
> Serve para humanos e agentes terem o mesmo vocabulário.

---

## Papéis Humanos

### GOD user
Pessoa “dona” da visão e da estratégia. Decide:
- quais projetos existem,
- quais agentes devem ser criados/usados,
- prioridades e direção geral.

Pode falar com qualquer agente, mas idealmente segue os playbooks do Agents Hub.

### Stakeholder
Qualquer pessoa interessada em um projeto (cliente, usuário final, time interno, etc.).

### Dev / Engenheiro
Pessoa responsável por:
- revisar e aplicar código gerado pelos agentes,
- criar integrações, infra, pipelines, etc.

---

## Estruturas do Ecossistema

### Agents Hub
Sistema meta onde:
- registramos projetos,
- registramos agentes (CORE e específicos),
- guardamos ideias/backlog,
- estruturamos conhecimento (docs, domínios),
- acompanhamos a evolução dos agentes.

É o “hub de projetos, agentes e ideias”.

### Projeto (Project)
Uma iniciativa concreta:
- pode ser um sistema (ex.: OlieHub),
- um produto digital,
- um site,
- um app,
- ou uma ferramenta interna.

Tem:
- objetivos,
- stack técnica,
- agentes associados,
- backlog de ideias.

### Sistema / Produto / App
Implementação concreta de um projeto:
- código,
- deploy,
- usuários reais.

### Domínio
Área de conhecimento do mundo real ligada a um projeto.
Exemplos:
- ateliê de costura (manufatura sob demanda),
- financeiro,
- educação,
- logística.

---

## Agentes e Camadas

### Agente
Qualquer “persona de IA” com:
- papel definido,
- objetivos claros,
- escopo específico,
- entradas/saídas típicas.

Exemplos:
- Catalyst Agent,
- Core Code Assistant,
- GOD Ideas Agent,
- Ops & Analytics Agent,
- Creative Experience Agent.

### CORE de Agentes
Conjunto de agentes “base” que podem apoiar qualquer projeto.
Exemplos:
- Catalyst Agent (ideias & arquitetura),
- Core Code Assistant (implementação),
- GOD Ideas Agent (backlog),
- Docs & Knowledge Agent (documentação),
- Ops & Analytics Agent (insights),
- Creative Experience Agent (design & conteúdo).

### Project Catalyst
Versão especializada do Catalyst para um projeto específico.
Exemplo:
- `agents-hub-catalyst-agent`,
- `oliehub-catalyst-agent`.

### Agents Architect & Orchestrator (God of Agents)
Agente responsável por:
- pensar a arquitetura do ecossistema de agentes,
- definir novos agentes,
- evitar duplicação,
- sugerir quais agentes usar em cada projeto.

---

## Documentos & Estruturas de Conhecimento

### Blueprint de Agente
Documento `.md` que descreve um agente:
- metadados (id, name, scope, version, status),
- role (papel),
- goals (objetivos),
- scope / out_of_scope,
- inputs / outputs,
- ferramentas / integrações,
- notas de segurança,
- exemplos de prompts,
- ideias de evolução.

### Knowledge / Conhecimento
Conjunto de arquivos com:
- visão de projetos,
- domínios (ex.: manufatura de ateliê),
- stack técnica,
- padrões,
- playbooks de interação.

### Playbook
Documento que descreve um fluxo/roteiro de trabalho.
Exemplos:
- como iniciar um novo projeto,
- como criar um novo módulo,
- como criar um novo agente.

### ADR (Architecture Decision Record) simplificado
Registro de uma decisão de arquitetura importante.
Contém:
- contexto,
- decisão,
- alternativas,
- consequências.

---

## Ideias, Backlog e Trabalho

### Idea / Ideia
Unidade básica de pensamento no backlog.
Pode ser:
- nova feature,
- melhoria,
- refactor,
- novo agente,
- experimento,
- conteúdo.

### Backlog
Lista organizada de ideias/iniciativas:
- com status (rascunho, pronto para design, em progresso…),
- com prioridade,
- ligada a projeto(s).

### Task / Tarefa
Trabalho mais granular derivado de ideias.
Exemplo:
- implementar endpoint X,
- ajustar layout Y,
- criar doc Z.

---

## Tecnologias (Resumo conceitual)

### Supabase
Backend-as-a-Service com Postgres, Auth, Realtime, Storage, Functions.

### Vercel
Plataforma de deploy de frontends e funções serverless/edge.

### Gemini / Google AI
Modelos de linguagem usados para diversos agentes (code, análise, criativos, etc.).

### GitHub
Repositórios de código, issues, PRs, automações de CI/CD.

### React / Vite / TypeScript / Tailwind
Stack típica de frontends:
- React para UI,
- Vite para build/dev,
- TypeScript para tipagem,
- Tailwind para estilos.

---

## Vocabulário de Fluxos

### Ideia → Projeto → Sistema
Fluxo natural:
1. Ideia nasce (GOD user ou agente).
2. Ideia é organizada (GOD Ideas Agent).
3. Vira Projeto (quando ganha foco e escopo).
4. Vira Sistema (quando ganha código, deploy e usuários).

### v1 / MVP
Primeira versão utilizável de um sistema/módulo/feature/agent.
Foco em:
- resolver o essencial,
- aprender rápido,
- evitar overengineering.

### Refactor
Reorganização de código/arquitetura sem mudar (muito) o comportamento visível.
Objetivo:
- deixar mais limpo,
- reduzir bugs,
- facilitar novas features.

---

## Outros Termos Úteis

### Módulo
Parte de um sistema com foco próprio:
- ex.: módulo de pedidos, módulo de produção, módulo de billing.

### Frente
Conjunto de trabalhos/ideias organizados por tema ou área:
- ex.: frente de UX, frente de performance, frente de integrações.

### Time de agentes
Conjunto de agentes que atuam juntos em um projeto ou fluxo:
- ex.: Catalyst + Code + Docs + Creative em um novo módulo.

Se surgirem novos termos recorrentes, este glossário deve ser atualizado.
