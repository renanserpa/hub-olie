# Camada de Arquitetura Técnica – Agents Hub

> Esta camada descreve os agentes focados em **arquitetura técnica, código, integrações e infraestrutura**.  
> Ela vem **abaixo** da Camada Cognitiva (Ideia & Direção) e **acima** da camada operacional/execução diária.

Enquanto a Camada Cognitiva trabalha com **IDEIA, VISÃO, PÚBLICO, ESTRATÉGIA e PROMPTS**,  
a **Camada de Arquitetura Técnica** transforma essas definições em **design técnico, código, integrações e deploys**.

---

## Visão Geral da Camada

- Traduz visão de produto e decisões estratégicas em:
  - arquitetura técnica (Supabase, Vercel, APIs, módulos),
  - schemas de banco e migrações,
  - código front/back,
  - integrações com serviços externos,
  - qualidade técnica (logs, testes, auditoria),
  - deploys e ambiente.

- Atua em conjunto com:
  - **Camada Cognitiva** (que fornece direção, personas, visão, prompts),
  - **Camada Operacional/Analytics** (que monitora uso, performance e feedback).

---

## Tabela de Agentes – Camada de Arquitetura Técnica

| Agente                          | Função                                                                     | Tipo                    |
|---------------------------------|----------------------------------------------------------------------------|-------------------------|
| 🧱 AI Systems Architect Generator | Cria estrutura técnica do projeto (Supabase, Vercel, módulos, pastas).      | Engenheiro de Software  |
| 💾 Engenheiro De Dados          | Cria e mantém schemas, migrações e mock data.                              | Backend / Database      |
| ⚙️ IntegratorAI                 | Integra APIs, backends e serviços externos.                                | DevOps                  |
| 🧑‍💻 WebAppDevAI                | Constrói interfaces web e apps (React, Next.js, Tailwind, etc.).           | Frontend                |
| 📊 AuditorDeSistema             | Audita logs, tabelas, triggers e KPIs técnicos.                            | QA / Compliance         |
| 🔐 EspecialistaRLS_RBAC         | Define e revisa regras de acesso (RLS, RBAC, permissões).                  | Segurança / Autorização |
| 🧰 CodeAssistantAI              | Refatora e valida código, ajuda em implementação e correção de bugs.       | Engenharia              |
| 🌐 APIConnectorAI               | Cria e documenta integrações REST/GraphQL, contratos de API.               | API Designer            |
| 🧩 TestAutomationAI             | Cria testes automatizados (unit, integration, e2e) e pipelines de CI/CD.   | QA Técnico              |
| 🚀 DeployManagerAI              | Cuida de deploys (Vercel, Cloudflare, Netlify, etc.) e configura ambientes.| Infraestrutura          |

---

## Como essa camada se encaixa no Agents Hub

1. **Entrada**  
   - Recebe insumos da Camada Cognitiva:
     - visão de sistema,
     - público e personas,
     - requisitos de alto nível,
     - decisões de stack (ex.: “React + Supabase + Vercel”),
     - prompts arquitetados.

2. **Processo interno**  
   - O **AI Systems Architect Generator** esboça:
     - módulos,
     - pastas,
     - fluxos,
     - componentes principais,
     - desenho de serviços e fronteiras.
   - O **Engenheiro De Dados** define:
     - tabelas,
     - colunas,
     - relações,
     - índices e migrações.
   - O **WebAppDevAI** e o **CodeAssistantAI**:
     - implementam e refinam UI e lógica de aplicação.
   - O **IntegratorAI** e o **APIConnectorAI**:
     - conectam sistemas externos,
     - desenham e documentam APIs.
   - O **TestAutomationAI**, **AuditorDeSistema** e **EspecialistaRLS_RBAC**:
     - garantem segurança, qualidade, consistência.
   - O **DeployManagerAI**:
     - orquestra deploy, variáveis de ambiente, domínios, pipelines.

3. **Saída**  
   - Entrega:
     - repositórios organizados,
     - schemas consistentes,
     - APIs definidas e documentadas,
     - testes e deploy configurados.
   - Tudo isso é registrado no **Agents Hub** como:
     - artefatos de projeto (repos, diagramas, configs),
     - decisões de arquitetura,
     - versões de agentes (ex.: v1, v2 do CodeAssistantAI para um projeto).

---

## Relação com outras camadas (exemplo de visão em camadas)

- **Camada 1 – Cognitiva (Ideia & Direção)**
  - Catalisador de Ideias, PersonaAI, StrategyAI, VisionAI, PromptArchitectAI, ArquitetoSupremo, AtlasAI Router.
  - Pergunta: “O que devemos construir e para quem?”

- **Camada 2 – Arquitetura Técnica (esta camada)**
  - Transformação de visão em solução técnica.
  - Pergunta: “Como vamos construir isso, de forma segura, escalável e clara?”

- **Camada 3 – Operação / Execução / Analytics (futuro)**
  - Agentes de operação, monitoramento, suporte, analytics, growth.
  - Pergunta: “Como está funcionando? O que precisamos melhorar?”

---

## Como usar estes agentes na prática

Dentro do Agents Hub, cada um desses agentes deve ter seu **Agent Blueprint** em arquivos `.md` próprios, por exemplo:

- `agents/ai-systems-architect-generator.md`
- `agents/data-engineer-ai.md`
- `agents/integrator-ai.md`
- `agents/webapp-dev-ai.md`
- `agents/auditor-de-sistema.md`
- `agents/especialista-rls-rbac.md`
- `agents/code-assistant-ai.md`
- `agents/api-connector-ai.md`
- `agents/test-automation-ai.md`
- `agents/deploy-manager-ai.md`

Cada blueprint deve conter:
- nome, id interno,
- projeto(s) em que atua,
- objetivos (goals),
- escopo / fora de escopo,
- inputs / outputs,
- integrações (GitHub, Supabase, Vercel, etc.),
- example_prompts,
- versão (v1, v2…).

Este documento (`Camada de Arquitetura Técnica`) funciona como visão geral da camada.  
Os blueprints individuais detalham o comportamento de cada agente.

---
