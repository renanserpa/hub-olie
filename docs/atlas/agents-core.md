# CORE de Agentes – Camada Fundamental do Agents Hub

> Este documento define o **núcleo comum de agentes** que pode existir em praticamente qualquer projeto
> dentro do Agents Hub. Ele não descreve todos os agentes possíveis, mas estabelece:
> - os tipos principais (CORE),
> - seus papéis,
> - e um formato padrão de blueprint.

O objetivo é garantir que **todo novo sistema/projeto** possa nascer com um “time base” de agentes bem definidos,
e que esses agentes sejam reutilizáveis entre projetos.

---

## 1. O que é o CORE de Agentes?

O **CORE de Agentes** é o conjunto mínimo de agentes que formam o “time padrão” para qualquer projeto:

1. Um agente de **ideias & arquitetura** (Catalyst).
2. Um agente de **código & implementação** (Code Assistant Core).
3. Um agente de **documentação & conhecimento** (Docs & Knowledge Agent).
4. Um agente de **backlog & GOD board** (GOD Ideas & Backlog Agent).
5. Um agente de **operações & analytics** (Ops & Analytics Agent).
6. Um agente de **experiência criativa** (Creative Experience Agent).

Cada projeto pode ter versões especializadas desses agentes, mas a ideia é que exista sempre:
- um núcleo comum de funções,
- com blueprints claros,
- e responsabilidades bem separadas.

O Agents Hub é o lugar onde esses agentes são:
- cadastrados,
- versionados,
- relacionados a projetos e ideias,
- e reaproveitados ao longo do tempo.

---

## 2. Formato Padrão de Blueprint de Agente

Todo agente no ecossistema deve seguir um padrão base de blueprint, contendo pelo menos:

- **Metadados**
  - `id` – identificador interno único (ex.: `catalyst-agent`, `core-code-assistant`)
  - `name` – nome amigável (ex.: “Catalyst Agent”, “Core Code Assistant”)
  - `project_scope` – `global` (template) ou `project-specific`
  - `version` – ex.: `1.0.0`
  - `status` – `active`, `experimental`, `deprecated`
  - `tags` – lista de palavras-chave (ex.: `code`, `docs`, `ops`, `creative`)

- **Definição**
  - `role` – papel principal do agente
  - `goals` – objetivos principais (lista)
  - `backstory / persona` – opcional, se fizer sentido
  - `scope` – o que o agente faz
  - `out_of_scope` – o que ele NÃO faz

- **Inputs / Outputs**
  - `inputs` – tipos de entrada (texto, arquivos, schemas, código, métricas, etc.)
  - `outputs` – tipos de saída (planos, prompts, código, docs, análises)

- **Ferramentas / Integrações**
  - `tools` – serviços/sistemas com os quais ele interage (conceitualmente)
  - `limitations` – limites, riscos, pontos em que precisa de apoio humano

- **Operational / Safety**
  - `safety_notes` – cuidados, validações, políticas
  - `review_points` – quando chamar GOD user ou outro agente antes de agir

- **Exemplos de Uso**
  - `example_prompts` – 2 a 5 exemplos de prompts ideais para esse agente

- **Evolução**
  - `versioning_notes` – como o agente pode ser melhorado nas próximas versões
  - `telemetry/feedback` – que tipo de feedback usar para torná-lo melhor

Esse padrão pode ser salvo como um modelo geral (`agent-blueprint-template.md`) e clonado
para cada agente específico.

---

## 3. Agentes CORE

Abaixo, uma visão de alto nível de cada agente do CORE.
Os detalhes completos podem ser colocados em arquivos individuais (`agents/*.md`).

### 3.1. Catalyst Agent (IDEIAS & ARQUITETURA)

- **id:** `catalyst-agent`
- **Papel:** transformar ideias em requisitos, arquiteturas e planos de implementação.
- **Escopo:** multi-projeto, global.
- **Inputs típicos:**
  - descrições de ideias, problemas, objetivos;
  - resumos de sistemas existentes;
  - arquivos de conhecimento (overview, stack, prompt kits).
- **Outputs típicos:**
  - resumos de requisitos;
  - propostas de arquitetura & fluxos;
  - planos em etapas;
  - blueprints de outros agentes;
  - prompts prontos para Code/DB/Creative Agents.
- **Observação:** blueprint detalhado já descrito em `catalyst-agent.md`.

### 3.2. Core Code Assistant (IMPLEMENTAÇÃO & REFACTOR)

- **id:** `core-code-assistant`
- **Papel:** implementar, refatorar e manter código com base nos planos do Catalyst e nas definições do projeto.
- **Escopo:** global como template; versões derivadas por projeto (ex.: `oliehub-code-assistant`).
- **Inputs típicos:**
  - plano do Catalyst (requisitos, arquitetura, passos);
  - contexto do repositório (stack, estruturas de pastas);
  - issues/tarefas específicas de implementação.
- **Outputs típicos:**
  - código (arquivos criados/editados);
  - refactors e melhorias;
  - anotações inline (TODO, comentários explicativos);
  - relatórios de mudanças (quais arquivos foram alterados, por quê).
- **Observações:**
  - Nunca altera o escopo de requisitos sem alinhamento via Catalyst ou GOD user.
  - Idealmente integrado a GitHub + Supabase + pipeline de testes.

### 3.3. Docs & Knowledge Agent (DOCUMENTAÇÃO & CONHECIMENTO)

- **id:** `docs-knowledge-agent`
- **Papel:** transformar conhecimento solto em documentação organizada; manter visão atualizada de sistemas, agentes e fluxos.
- **Escopo:** multi-projeto, com visões específicas por projeto.
- **Inputs típicos:**
  - decisões de design do Catalyst;
  - código e estrutura de pastas;
  - schemas de banco;
  - conversas importantes (resumos).
- **Outputs típicos:**
  - READMEs;
  - documentação de módulos;
  - ADRs (Architecture Decision Records) simplificados;
  - resumos para onboarding de devs e stakeholders.
- **Observações:**
  - Funciona como “bibliotecário” do ecossistema.
  - Pode sugerir onde armazenar e como versionar docs (ex.: `docs/`, wikis, sites de docs).

### 3.4. GOD Ideas & Backlog Agent (BACKLOG & ESTRATÉGIA)

- **id:** `god-ideas-agent`
- **Papel:** ajudar o GOD user a organizar, priorizar e refinar o backlog de ideias, decisões e estratégias.
- **Escopo:** global, mas com visualizações por projeto.
- **Inputs típicos:**
  - ideias soltas;
  - feedback de usuários;
  - relatórios de bugs/problemas;
  - insights dos outros agentes (Catalyst, Ops, etc.).
- **Outputs típicos:**
  - registros de `ideas` bem estruturados;
  - sugestões de priorização (impacto x esforço);
  - agrupamentos de ideias por tema/módulo;
  - listas de “próximos candidatos a virar projeto/módulo”.
- **Observações:**
  - Não muda código; atua em nível de ideação e priorização.
  - Pode gerar prompts para Catalyst quando uma ideia estiver madura o suficiente para virar design/arquitetura.

### 3.5. Ops & Analytics Agent (OPERAÇÕES & INSIGHTS)

- **id:** `ops-analytics-agent`
- **Papel:** ler dados operacionais (métricas, logs, KPIs) e produzir insights práticos.
- **Escopo:** por sistema/projeto, com um template global.
- **Inputs típicos:**
  - KPIs (financeiros, operacionais, de uso);
  - relatórios de erros (ex.: Sentry);
  - métricas de performance (tempo de resposta, filas, etc.).
- **Outputs típicos:**
  - resumos de saúde do sistema;
  - alertas de gargalos e riscos;
  - sugestões de ajustes em processos ou arquitetura;
  - prompts para Catalyst/Core Code Assistant quando uma melhoria técnica é necessária.
- **Observações:**
  - Atua como “olhos e cérebro analítico” sobre o funcionamento real dos sistemas.

### 3.6. Creative Experience Agent (DESIGN & CONTEÚDO)

- **id:** `creative-experience-agent`
- **Papel:** apoiar na criação de experiências criativas ligadas aos projetos (visual, textual, sonora).
- **Escopo:** global com especializações por projeto.
- **Inputs típicos:**
  - descrições de projetos/sistemas;
  - público-alvo, tom de voz, identidade desejada;
  - necessidades de materiais (site, apresentação, posts, vídeos, etc.).
- **Outputs típicos:**
  - propostas de identidade visual (paletas, tipografia, estilo);
  - estruturas de landing pages, telas, fluxos;
  - roteiros de vídeo, copy para posts, scripts;
  - ideias de experiências interativas (jogos simples, simuladores, etc.).
- **Observações:**
  - Trabalha em conjunto com Figma/Canva/afins (conceitualmente);
  - Pode gerar briefs claros para designers humanos ou outras ferramentas.

---

## 4. Regras de Colaboração entre Agentes CORE

- O **Catalyst Agent** é o ponto de partida:
  - interpreta ideias,
  - organiza requisitos,
  - desenha arquitetura,
  - define quando chamar cada agente do CORE.

- O **Core Code Assistant** não decide escopo sozinho:
  - segue o plano do Catalyst,
  - registra dúvidas,
  - não inventa features sem alinhamento.

- O **Docs & Knowledge Agent** acompanha tudo:
  - transforma decisões em documentação,
  - mantém o estado atual descrito,
  - facilita onboarding e manutenção.

- O **GOD Ideas & Backlog Agent**:
  - ajuda o GOD user a organizar prioridades,
  - não atropela o Catalyst nem o Code Assistant,
  - funciona como “filtro e organizador” do que entra no pipeline.

- O **Ops & Analytics Agent**:
  - observa o resultado em produção,
  - sinaliza problemas e oportunidades,
  - realimenta o GOD board e o Catalyst com evidências.

- O **Creative Experience Agent**:
  - garante que a visão externa (design, conteúdo, comunicação) esteja alinhada com o que é construído,
  - trabalha tanto com material interno (docs, apresentações) quanto externo (site, marketing).

---

## 5. Uso do CORE no Agents Hub

No **Agents Hub**, o CORE pode aparecer assim:

- Tabelas:
  - `agents` – registro de cada agente (incluindo os do CORE e suas variantes por projeto)
  - `agent_versions` – histórico de versões e ajustes
  - `projects` – sistemas/produtos nos quais esses agentes atuam
  - `ideas` – backlog conectado aos agentes (de quem veio, quem trabalhou, etc.)

- Convenção sugerida:
  - Agentes CORE globais têm `project_scope = 'global'`.
  - Versões especializadas por projeto carregam um campo `base_agent_id` apontando para o CORE.

Exemplo:
- `catalyst-agent` (global)  
- `oliehub-catalyst-agent` (especialização, se necessário)  
- `core-code-assistant` (global)  
- `oliehub-code-assistant` (ligado ao repo do OlieHub)  

---

## 6. Próximos passos

1. Criar blueprints individuais (`.md`) para cada agente CORE:
   - `core-code-assistant.md`
   - `docs-knowledge-agent.md`
   - `god-ideas-agent.md`
   - `ops-analytics-agent.md`
   - `creative-experience-agent.md`

2. Definir como esses agentes serão registrados na base do Agents Hub
   (tabelas `agents` e `agent_versions`, campos mínimos).

3. Quando um projeto novo nascer:
   - Clonar/ligar os agentes CORE relevantes,
   - E ir especializando conforme o contexto do projeto.

4. Iterar continuamente:
   - Captando feedback real de uso dos agentes,
   - Ajustando seus blueprints,
   - E alimentando o Agents Hub com versões melhoradas.
