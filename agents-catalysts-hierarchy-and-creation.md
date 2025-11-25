# Hierarquia de Catalisadores & Criação de Novos Agentes – Agents Hub (v1)

> Este documento define:
> - como funciona a **hierarquia de Catalisadores** (master + por frente/projeto),
> - como um Catalisador convoca e coordena o seu “time” de agentes especializados,
> - e qual é o **pipeline padrão** para criação de novos agentes já completos.

---

## 1. Hierarquia de Catalisadores e Agentes

### 1.1. Níveis principais

1. **GOD User (humano)**
   - Dono da visão, da estratégia e das decisões finais.
   - Pode conversar com qualquer agente diretamente, mas idealmente usa os fluxos do Agents Hub.

2. **Master Catalyst Agent**
   - Catalisador **global**.
   - Especialista em transformar ideias em:
     - requisitos,
     - arquitetura de sistemas,
     - planos de implementação,
     - blueprints iniciais de agentes.
   - Pensa no ecossistema todo (multi-projeto, multi-agente).

3. **Agents Architect & Orchestrator (God of Agents)**
   - Arquiteto-chefe de agentes.
   - Decide:
     - quais agentes devem existir,
     - quais são CORE,
     - quais são específicos de projeto,
     - quando criar/alterar/deprecar agentes.
   - Gera blueprints completos de novos agentes.

4. **Catalisadores por Frente / Projeto (Project Catalysts)**
   - Derivados do Master Catalyst, mas focados em **um projeto específico**.
   - Exemplos:
     - `agents-hub-catalyst-agent` (para o próprio Agents Hub),
     - `oliehub-catalyst-agent` (para o OlieHub, quando for o caso),
     - etc.
   - Conhecem profundamente:
     - o domínio do projeto,
     - seus módulos,
     - seus agentes associados.

5. **Agentes Especialistas (Core + específicos)**
   - Core Code Assistant
   - GOD Ideas & Backlog Agent
   - Docs & Knowledge Agent
   - Ops & Analytics Agent
   - Creative Experience Agent
   - Outros agentes específicos criados ao longo do tempo.

### 1.2. Situação atual

- Já temos definido conceitualmente:
  - **Master Catalyst Agent** (global),
  - **GOD Ideas Agent**,
  - **Core Code Assistant**,
  - **Agents Architect & Orchestrator**,
  - **outros CORE** (Docs, Ops, Creative – ainda em blueprint alto nível).
- Ainda **não criamos explicitamente** catalisadores por projeto (ex.: `agents-hub-catalyst-agent.md`),  
  mas este documento define **como eles devem nascer**.

---

## 2. O que é um “Catalisador de Frente / Projeto”

Um **Catalisador de Frente** (Project Catalyst):

- herda a lógica e o estilo do Master Catalyst,
- mas é **especializado em um projeto/sistema específico**,
- age como “líder de orquestra” daquele projeto, convocando seus agentes especializados.

### 2.1. Responsabilidades do Project Catalyst

Para um projeto X (ex.: Agents Hub, OlieHub, outro sistema), o Project Catalyst:

- Recebe a demanda principal:
  - “quero um novo módulo”,
  - “quero refatorar esse fluxo”,
  - “quero integrar com tal API”,
  - “quero criar um agente específico para esse sistema”.

- Faz perguntas de clarificação (exatamente como o Master Catalyst faz), mas:
  - já conhece o contexto do projeto,
  - já sabe quais agentes estão disponíveis para aquele projeto,
  - já sabe o modelo de dados e stack principais.

- Produz:
  - requisitos detalhados para aquele projeto,
  - arquitetura focada no contexto local,
  - plano em etapas,
  - lista de agentes que devem atuar (Code, Docs, Creative, Ops, etc.).

- Convoca os especialistas:
  - envia prompts bem definidos para o Core Code Assistant (ou versão específica do projeto),
  - aponta o que o Docs Agent precisa documentar,
  - sugere para o Creative Agent o que precisa ser produzido,
  - aciona o Ops Agent quando houver impactos operacionais.

### 2.2. Diferença entre Master Catalyst e Project Catalyst

- **Master Catalyst**
  - pensa no ecossistema inteiro,
  - desenha sistemas de alto nível,
  - define padrões,
  - ajuda a criar **Project Catalysts**.

- **Project Catalyst**
  - pensa na “vivência” de um projeto específico,
  - recebe demandas daquele projeto no dia a dia,
  - orquestra o time de agentes daquele projeto.

---

## 3. Fluxograma Geral com Catalisadores

Fluxo macro (incluindo Master Catalyst e Catalisadores de Projeto):

```text
[GOD User]
   |
   v
[GOD Ideas & Backlog Agent]
   |
   +--> (ideias globais / multi-projeto) --> [Master Catalyst Agent]
   |
   +--> (ideias ligadas a projeto X) ------> [Project Catalyst X]
                                               |
                                               v
                                  [Requisitos + Arquitetura + Plano para o Projeto X]
                                               |
                                               v
                                   (convocação de agentes especializados)
                                               |
             +-------------------------+-------+--------------------------+
             |                         |                                  |
             v                         v                                  v
  [Code Assistant (X)]        [Docs & Knowledge Agent (X)]     [Creative Experience Agent (X)]
             |                         |                                  |
             v                         v                                  v
      [Código & Integrações]    [Documentação/Decisões]          [Telas, Conteúdo, Mídia]
             \                         |                                  /
              \                        v                                 /
               +----------------> [Ops & Analytics Agent (X)] <---------+
                                       |
                                       v
                         [Insights, Problemas, Oportunidades]
                                       |
                                       v
                         (volta como novas ideias para o backlog)
                                       |
                                       v
                         [GOD Ideas & Backlog Agent] (ciclo)
```

---

## 4. Pipeline Padrão de Criação de Novo Agente

### 4.1. Princípio importante

> **Todo novo agente deve nascer já completo em blueprint**  
> (mesmo que depois seja refinado).

Isso significa:

- nada de “vamos ver depois o que ele faz”;
- já nasce com:
  - papel,
  - escopo,
  - entradas/saídas,
  - integrações,
  - exemplos de prompts,
  - e ideia clara de quais conhecimentos (docs/arquivos) ele precisa.

### 4.2. Etapas do pipeline

1. **Proposta de Agente (Agent Proposal)**  
   Origem:
   - GOD user, ou
   - sugestão de um agente superior (Master Catalyst, Agents Architect, Project Catalyst).

   A proposta deve conter pelo menos:
   - nome provisório,
   - problema que resolve,
   - em qual projeto atua (ou se é global),
   - tipo (técnico, criativo, ops, produto, etc.),
   - impacto esperado.

2. **Refino pelo Agents Architect (God of Agents)**  
   - Analisa se:
     - já existe agente semelhante,
     - é uma variante de um agente CORE,
     - é um agente totalmente novo.
   - Decide:
     - `scope = global` ou `scope = project`.
   - Monta ou pede que o Catalyst auxilie na visão de como se encaixa no ecossistema.

3. **Criação do Blueprint Completo**  
   - Gerar documento `.md` seguindo o padrão de blueprint (metadados, role, goals, scope, inputs, outputs, tools, safety, example_prompts).
   - Especificar também:
     - quais arquivos de conhecimento são importantes,
     - quais stacks / APIs domina (se for técnico),
     - quais formatos de saída produz (textos, imagens, scripts, etc.).

4. **Validação pelo GOD user**  
   - GOD user revisa o blueprint:
     - confirma se o agente realmente é necessário,
     - ajusta expectativas,
     - aprova a criação.

5. **Registro no Agents Hub**  
   - Criar registro em `agents` (conceito) e `agent_versions`.
   - Armazenar o `.md` em local adequado (`agents/` ou similar).

6. **Integração com projetos e fluxos**  
   - Agents Architect e Project Catalysts passam a considerar esse agente:
     - quando montarem “times de agentes” por projeto,
     - quando receberem ideias que podem ser atendidas por ele.

7. **Evolução contínua**  
   - Feedback dos demais agentes (Ops, Docs, Code, etc.) e do GOD user:
     - gera ideias de melhoria,
     - alimenta o GOD Ideas Agent,
     - que volta para o Agents Architect para revisão do blueprint (nova versão).

---

## 5. Estrutura de uma “Agent Proposal” (modelo)

Quando um agente superior (ou o GOD user) sugerir um novo agente, a proposta mínima deve conter:

```text
[AGENT PROPOSAL]

Origem da proposta:
- Quem está sugerindo? (GOD user, Master Catalyst, Project Catalyst X, etc.)

Contexto:
- Projeto(s) alvo(s): [ex.: Agents Hub, OlieHub, múltiplos]
- Problema/dor principal: [descrição]
- Oportunidade: [o que ganhamos se esse agente existir?]

Tipo de agente:
- [ ] Técnico (code, DB, infra)
- [ ] Produto/Planejamento
- [ ] Criativo (design/conteúdo/mídia)
- [ ] Ops/Analytics
- [ ] Suporte/atendimento
- [ ] Outro: [descrever]

Escopo sugerido:
- [ ] Global (multi-projeto)
- [ ] Específico de projeto: [nome do projeto]

Ações esperadas:
- O que esse agente deve conseguir fazer no dia a dia?

Exemplos de uso:
- Liste 2–3 cenários em que alguém chamaria esse agente.
```

O **Agents Architect** pega essa proposta e devolve um **blueprint completo**.

---

## 6. Como usar este documento na prática

- Sempre que surgir uma nova “frente” (novo projeto grande):
  - criar (quando fizer sentido) um **Project Catalyst** baseado no Master,
  - definir quais agentes CORE ele vai usar primeiro,
  - registrar isso no Agents Hub.

- Sempre que surgir uma ideia de novo agente:
  - registrar como **Agent Proposal** (mesmo de forma resumida),
  - passar pelo fluxo Agents Architect → Blueprint → GOD user → registro.

- Esse documento vira referência para:
  - o próprio Catalyst (quando sugerir novos agentes),
  - o Agents Architect,
  - o GOD user quando quiser “crescer o time de agentes” de forma organizada.

---
