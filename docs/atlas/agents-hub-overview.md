# Agents Hub – Visão Geral Conceitual

> Este documento descreve o **Hub Genérico de Projetos, Agentes e Ideias**  
> (NÃO é o OlieHub em si – o OlieHub será apenas um dos primeiros projetos a viver dentro deste Hub).

---

## 1. O que é o Agents Hub?

O **Agents Hub** é um sistema genérico para organizar:

- **Ideias** → que podem virar
- **Projetos** → que podem virar
- **Sistemas / Produtos / Apps** → que geram
- **Apresentações, materiais, conteúdo, agentes de IA e melhorias contínuas**.

Ele funciona como um **“cérebro organizador de projetos e agentes”**, independente da tecnologia usada dentro de cada projeto.

O OlieHub é apenas um **primeiro caso de uso** dentro deste Hub – um projeto entre vários.

---

## 2. Objetivos principais do Agents Hub

1. **Centralizar Ideias**
   - Guardar ideias vindas de qualquer lugar (conversas, documentos, insights espontâneos).
   - Evitar que boas ideias se percam em chats soltos ou arquivos espalhados.

2. **Evoluir Ideias em Projetos**
   - Marcar quando uma ideia virou um projeto concreto.
   - Relacionar ideias derivadas, versões, pivotagens e forks.

3. **Conectar Projetos a Sistemas / Produtos**
   - Ligar projetos a repositórios (GitHub, etc.).
   - Ligar projetos a sistemas em produção (deploys, domínios, APIs).

4. **Orquestrar Agentes de IA**
   - Cadastrar agentes (técnicos, criativos, operacionais, analíticos).
   - Definir blueprints de cada agente (goals, escopo, inputs/outputs, integrações).
   - Permitir reuso de agentes entre projetos.

5. **Gerenciar Backlog e Melhorias**
   - Backlog central de ideias por projeto ou global.
   - Ligações entre ideias → tarefas → PRs → releases.
   - Histórico de decisões: o que foi feito, o que foi descartado, o que permanece em estudo.

6. **Servir como memória estratégica**
   - Saber quais projetos existem, quais morreram, quais estão ativos.
   - Saber quais agentes existem e em que são bons.
   - Usar o histórico como base para novos projetos e novas versões.

---

## 3. Diferença entre Agents Hub e OlieHub

- **Agents Hub**
  - É o sistema meta, genérico.
  - Gerencia projetos de qualquer tipo (ERPs, apps, sites, jogos, bots, etc.).
  - Gerencia agentes de IA e ideias de forma abstrata.
  - O foco é **orquestração de conhecimento, projetos e agentes**.

- **OlieHub**
  - É um projeto específico dentro do Agents Hub.
  - É um ERP / plataforma de operações para o Ateliê Olie (manufatura + varejo).
  - Tem seu próprio banco (Supabase), módulos (Pedidos, Produção, Estoque...).
  - Vai ser um dos **primeiros “clientes”** do Agents Hub, usado como laboratório real.

Em resumo:
- O **Agents Hub** é o “sistema dos sistemas e agentes”.  
- O **OlieHub** é um desses sistemas, e será o piloto principal.

---

## 4. Fluxo macro: da ideia à melhoria contínua

1. **Ideia nasce**
   - Pode surgir em conversa com um agente (Catalyst, por exemplo), numa reunião, num insight do GOD user.
   - É registrada no Agents Hub como uma **Idea**, com contexto mínimo (título, descrição, tags, origem).

2. **Ideia vira Projeto**
   - Quando decidida como “vale investir”, ela é promovida a **Project**.
   - São definidos:
     - objetivos,
     - stakeholders,
     - tecnologias iniciais sugeridas,
     - primeiros agentes envolvidos (ex.: Catalyst + Code Assistant).

3. **Projeto vira Sistema / Produto**
   - O projeto ganha um repositório (GitHub) e começa a ser implementado.
   - O Agents Hub registra:
     - links de repositórios,
     - ambientes (dev, staging, prod),
     - status (inception, build, beta, production, maintenance).

4. **Sistema gera materiais e agentes**
   - A partir do sistema, são criados:
     - **apresentações**, materiais de venda, documentação,
     - **agentes especializados** (ex.: Support Agent, Ops Agent, Code Agent para aquele sistema),
     - **conteúdo** (site, posts, vídeos, etc.).

5. **Melhorias e ideias retornam ao Hub**
   - Novas ideias de features, refactors, integrações e agentes voltam como **Ideas** ligadas ao projeto.
   - O Agents Hub as registra, relaciona e permite priorização.
   - O ciclo continua: IDEIA → PROJETO → SISTEMA → AGENTES/CONTEÚDO → IDEIAS.

---

## 5. Tipos de agentes previstos no ecossistema

O Agents Hub não é só para apps técnicos. Ele também abrange agentes criativos.

Exemplos de categorias:

1. **Agentes Técnicos**
   - Code Assistants (GitHub + Supabase + Vercel)
   - DB/SQL Assistants
   - DevOps/Infra Assistants
   - Test/QA Assistants

2. **Agentes de Produto & Arquitetura**
   - Catalyst Agent (ideias, design, planejamento)
   - Requirements/Docs Agent
   - Roadmap/Prioritização Agent

3. **Agentes Criativos**
   - Design UI/UX Agent (telas, flows, componentes)
   - Visual Content Agent (posts, catálogos, imagens)
   - Video/Script Agent (roteiros, storytelling)
   - Game/Experience Agent (jogos, interações)
   - Music/Audio Agent (identidade sonora, trilhas simples)

4. **Agentes Operacionais & Suporte**
   - Support Agent (FAQ, orientação, troubleshooting)
   - Ops Agent (monitoramento, alertas, análises operacionais)
   - Analytics Agent (dashboards, insights, relatórios)

O Agents Hub será o lugar onde tudo isso é **descrito, versionado, conectado e reaproveitado**.

---

## 6. Papel do Catalyst Agent dentro do Agents Hub

O **Catalyst Agent** é o “primeiro agente oficial” do ecossistema, com papel de:

- Entrevistar o GOD user e stakeholders.
- Transformar ideias em:
  - especificações de sistemas,
  - blueprints de agentes,
  - planos de implementação.
- Sugerir onde e como registrar:
  - projetos,
  - agentes,
  - ideias,
  - conversas importantes.

O Catalyst não implementa nada diretamente; ele é o **designer/arquitetor** que alimenta o Agents Hub de forma organizada.

---

## 7. Próximos passos (conceituais)

1. **Definir modelo de dados conceitual do Agents Hub**
   - Entidades principais:
     - `projects`
     - `agents`
     - `agent_versions`
     - `ideas`
     - `conversations` (metadados)
     - (futuramente) `tasks`, `links externos` etc.

2. **Desenhar UX do GOD user**
   - Painel de visão geral:
     - quantos projetos, quantos agentes, quantas ideias, status.
   - Tela de detalhe de projeto com:
     - ideias ligadas,
     - agentes usados,
     - links de repositório e produção.
   - Tela de cadastro/edição de agentes (blueprints).

3. **Escolher primeiro projeto piloto dentro do Hub**
   - O **OlieHub** é um forte candidato para ser o primeiro projeto formalmente registrado.

4. **Começar a escrever blueprints de agentes**
   - Catalyst Agent (já iniciado);
   - Próximos: Code Assistant genérico, Agents Hub Manager, GOD Ideas Agent, etc.

---

## 8. Lembrete importante

- O **Agents Hub** é genérico, multi-projeto, multi-agente.  
- O **OlieHub** é um desses projetos, um estudo de caso real para provar o valor do Hub.  
- Tudo que for criado para o OlieHub (agentes, fluxos, melhorias) deve, idealmente, aparecer como conhecimento reaproveitável dentro do Agents Hub.

