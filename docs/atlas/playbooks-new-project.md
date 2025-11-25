# Playbook – Novo Projeto no Agents Hub (v1)

> Roteiro passo a passo para criar um **novo projeto** dentro do ecossistema
> e já conectá-lo ao time de agentes.

Este playbook é para o GOD user, mas os agentes podem usá-lo como referência de fluxo.

---

## 1. Definir a ideia base do projeto

**Objetivo:** ter uma descrição clara o suficiente para ser registrada como projeto.

1. Fale com o **GOD Ideas & Backlog Agent**:
   - Descreva a ideia em texto livre.
   - Diga se ela é:
     - um produto novo,
     - um sistema interno,
     - uma evolução grande de algo existente.

2. Peça a ele para:
   - estruturar a ideia,
   - sugerir tipo (produto, internal tool, experimento),
   - indicar se está pronta para virar projeto.

3. Se a ideia for aprovada como projeto:
   - defina um nome amigável,
   - e um `slug` seguindo `naming-conventions.md`.

**Saída:**  
- Uma `idea` marcada como base de um novo `project`.

---

## 2. Registrar o Projeto no Agents Hub

**Objetivo:** criar o registro conceitual do projeto.

1. Criar (ou pedir para um agente descrever) os campos principais de `projects`:
   - `name`,
   - `slug`,
   - `description`,
   - `type` (`product`, `internal_tool`, `experiment`),
   - `status` inicial (ex.: `discovery` ou `planning`),
   - stack sugerida (ex.: “React + Supabase + Vercel”).

2. Criar/atualizar o arquivo de knowledge do projeto:
   - `knowledge/projects/<project-slug>/<project-slug>-overview.md`

   Conteúdo mínimo:
   - visão geral,
   - objetivos,
   - público-alvo,
   - problemas que resolve,
   - MVP desejado.

3. (Opcional) Registrar a conversa de inception em `conversations`:
   - título,
   - resumo,
   - link para chat/doc.

**Saída:**  
- Registro inicial em `projects` (conceitual ou já em banco).
- Arquivo `<project-slug>-overview.md` criado.

---

## 3. Definir o time inicial de agentes do projeto

**Objetivo:** escolher quais agentes vão atuar na v1 do projeto.

1. Falar com o **Agents Architect & Orchestrator**:

   ```text
   Tenho um novo projeto chamado [nome / slug].
   Aqui está o overview: [resumo ou link].
   Me ajude a definir o time inicial de agentes para este projeto,
   com base no nosso CORE.
   ```

2. O Agents Architect deve sugerir:
   - uso de:
     - GOD Ideas Agent (sempre),
     - Project Catalyst (derivado do Master),
     - Code Assistant específico do projeto (derivado do Core),
     - Docs Agent (global ou específico),
     - Creative Agent (se fizer sentido),
     - Ops Agent (quando houver operação real).
   - se necessário, propor novos agentes específicos.

3. Criar (ou ao menos planejar) blueprints:
   - `knowledge/projects/<project-slug>/agents/<project-slug>-catalyst-agent.md`
   - `knowledge/projects/<project-slug>/agents/<project-slug>-code-assistant.md`
   - etc.

**Saída:**  
- Lista de agentes do projeto.
- Blueprints iniciais criados ou planejados.

---

## 4. Desenhar o MVP com o Catalyst

**Objetivo:** transformar a ideia em um MVP claro e viável.

1. Falar com o **Catalyst Agent** (ou Project Catalyst, se já existir):

   - Enviar:
     - overview do projeto,
     - objetivo do MVP,
     - restrições (tempo, orçamento, stack).

   - Pedir:
     1. Reescrever entendimento.
     2. Fazer perguntas.
     3. Propor:
        - escopo da v1,
        - módulos principais,
        - fluxos essenciais,
        - modelo de dados de alto nível,
        - plano em etapas.

2. Revisar o plano junto com o GOD user.

3. Se necessário, iterar até ficar “bom o suficiente” para começar.

**Saída:**  
- Specification inicial do MVP,
- plano em etapas (Step 1, Step 2…).

---

## 5. Criar o esqueleto técnico do projeto

**Objetivo:** preparar o terreno para implementação (repositório, stack, etc.).

1. Criar repositório (GitHub ou outro) com nome baseado no `slug`.
2. Definir stack base (se ainda não estiver definida):
   - ex.: React + Vite + TS + Supabase + Tailwind + Vercel.
3. Pedir ajuda ao **Core Code Assistant** (ou agent específico) para:
   - gerar a estrutura inicial do projeto,
   - configurar supabase client,
   - organizar pastas conforme `naming-conventions.md`,
   - criar arquivos de exemplo (App, layout, etc.).

**Saída:**  
- Projeto inicial criado,
- pronto para começar a implementar as etapas do plano.

---

## 6. Executar a v1 em pequenos ciclos

**Objetivo:** implementar a v1 do projeto iterando com segurança.

1. Escolher com o Catalyst / GOD user qual etapa do plano vem primeiro (Step 1).
2. Para cada etapa:
   - detalhar o escopo,
   - chamar o Code Assistant,
   - implementar,
   - revisar código,
   - testar (manual/automático),
   - documentar mudanças (Docs Agent),
   - se aplicável, ajustar fluxos.

3. Evitar:
   - pular entre muitas etapas sem fechar nenhuma,
   - implementar coisas fora do escopo da v1.

**Saída:**  
- Módulos do MVP ganhando vida passo a passo.

---

## 7. Preparar para operação e evolução

**Objetivo:** garantir que o projeto não morra logo após a v1.

1. Envolver o **Ops & Analytics Agent** quando houver dados reais:
   - log de erros,
   - métricas de uso,
   - tempos de resposta,
   - feedback de usuários.

2. Transformar insights em novas ideias:
   - passar para o GOD Ideas Agent,
   - organizar backlog,
   - planejar v1.1, v2, etc.

3. Atualizar:
   - docs do projeto,
   - status/roadmap.

**Saída:**  
- Projeto em ciclo de evolução contínua,
- pronto para acumular conhecimento e melhorias.

---

## 8. Resumo do fluxo em forma curta

```text
1) Ideia → GOD Ideas Agent
2) Virou projeto → registrar em projects + overview.md
3) Time de agentes → Agents Architect
4) MVP & arquitetura → Catalyst (ou Project Catalyst)
5) Esqueleto técnico → Code Assistant
6) Implementação em etapas → Code + Docs + (Creative/Ops)
7) Observação, insights → Ops Agent
8) Novas ideias → GOD Ideas Agent (ciclo)
```

Este playbook pode ser refinado conforme usarmos em projetos reais.
