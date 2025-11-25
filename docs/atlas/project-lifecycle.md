# Project Lifecycle – Do Insight ao Sistema em Produção

> Este documento descreve como uma ideia se transforma em:
> - Projeto,
> - Sistema/App,
> - Produto em evolução contínua,
> usando o ecossistema de agentes do Agents Hub.

---

## 1. Fases do Ciclo de Vida

### Fase 0 – Insight / Semente de Ideia

**Entrada:**  
- Um pensamento, reclamação, oportunidade, pergunta.
- Pode vir do GOD user, de um stakeholder, de dados (Ops), de outro agente.

**Agente principal:**  
- GOD Ideas & Backlog Agent

**Atividades típicas:**
- Capturar a ideia (texto solto, lista, resumo).
- Estruturar a ideia em um registro com título, descrição, tipo, origem.
- Ligar a um projeto existente (se já existir) ou marcar como “global”.
- Definir status inicial (ex.: `draft` ou `triage`).

**Saída:**  
- `Idea` registrada no Agents Hub.

---

### Fase 1 – Clarificação & Priorização

**Entrada:**  
- Lista de `ideas` (algumas relacionadas, outras soltas).

**Agente principal:**  
- GOD Ideas & Backlog Agent

**Agentes de apoio:**  
- GOD user (decisão),
- Ops & Analytics Agent (dados, quando existirem).

**Atividades típicas:**
- Agrupar ideias por tema/projeto.
- Remover duplicadas / unir parecidas.
- Estimar impacto (qualitativo).
- Estimar esforço (grosso modo).
- Sugerir prioridade.

**Saída:**  
- Ideias com status mais maduro (por ex.: `ready_for_design` para as priorizadas).
- Lista de “candidatas” à próxima fase.

---

### Fase 2 – Design & Arquitetura (Projeto / Módulo / Sistema)

**Entrada:**  
- Ideia com status `ready_for_design`.

**Agente principal:**  
- Catalyst Agent (global) ou Project Catalyst (para um projeto específico).

**Agentes de apoio:**  
- Agents Architect & Orchestrator (se envolver novos agentes),
- GOD user (alinhamento),
- eventualmente Creative Agent (se UX/visual for parte grande da ideia).

**Atividades típicas:**
- Entrevistar o GOD user / stakeholders (perguntas).
- Clarificar objetivo, restrições, usuários, contexto.
- Propor:
  - requisitos funcionais principais,
  - requisitos não funcionais relevantes,
  - fluxos de alto nível,
  - arquitetura (entidades, módulos, serviços, integrações).
- Definir **plano em etapas** (Step 1, 2, 3…).

**Saída:**  
- Especificação de módulo/sistema/projeto (em markdown).
- Plano em etapas de implementação.

---

### Fase 3 – Planejamento de Execução

**Entrada:**  
- Plano em etapas gerado pelo Catalyst.

**Agentes principais:**
- GOD user / PO
- (Facultativo) GOD Ideas Agent para quebrar etapas em itens de backlog.

**Agentes de apoio:**  
- Core Code Assistant (consulta sobre esforço técnico),
- Docs & Knowledge Agent (preparo de docs iniciais).

**Atividades típicas:**
- Escolher o que entra na v1 / MVP.
- Definir ordem de execução das etapas.
- Quebrar etapas em tasks (quando for útil).
- Preparar repositório, ambientes e ferramentas.

**Saída:**  
- Lista de etapas/tarefas acordadas para implementação.
- Definição clara de “escopo da v1”.

---

### Fase 4 – Implementação

**Entrada:**  
- Etapas definidas (Step 1, Step 2, etc.).
- Contexto do repositório e da stack.

**Agente principal:**  
- Core Code Assistant (ou versão por projeto).

**Agentes de apoio:**  
- Catalyst Agent (para dúvidas de design),
- Docs & Knowledge Agent (para registrar decisões),
- Creative Agent (para UI/UX/visuais).

**Atividades típicas:**
- Implementar features em pequenos passos.
- Criar/editar arquivos conforme padrões do projeto.
- Tratar erros, estados de loading, feedbacks.
- Manter rastreabilidade (o que foi feito, onde, por quê).

**Saída:**  
- Código funcional,
- Módulos/fluxos implementados,
- Branches/PRs prontos para revisão humana.

---

### Fase 5 – Documentação & Alinhamento

**Entrada:**  
- Código implementado,
- Decisões de design que foram tomadas no caminho.

**Agente principal:**  
- Docs & Knowledge Agent

**Agentes de apoio:**  
- Catalyst (contexto de arquitetura),
- Core Code Assistant (detalhes técnicos).

**Atividades típicas:**
- Gerar/atualizar:
  - READMEs,
  - docs de módulos,
  - resumos de fluxos,
  - ADRs simplificados (decisões importantes).
- Facilitar onboarding de novos devs/stakeholders.

**Saída:**  
- Documentação atualizada,
- Registro das decisões relevantes.

---

### Fase 6 – Deploy & Operação

**Entrada:**  
- Versão pronta para ser posta em uso (ambiente de testes ou produção).

**Agentes principais:**
- Dev/DevOps humano,
- futuramente: agente de infra/DevOps (a ser definido).

**Agente de apoio:**  
- Ops & Analytics Agent (para observar comportamento).

**Atividades típicas:**
- Deploy em ambientes (dev, staging, prod).
- Configuração de env vars, secrets, etc.
- Configuração de monitoramento e logging.

**Saída:**  
- Sistema em uso,
- Telemetria e logs disponíveis.

---

### Fase 7 – Observação & Insights

**Entrada:**  
- Sistema em uso,
- Dados, logs, métricas, feedback de usuários.

**Agente principal:**  
- Ops & Analytics Agent

**Agentes de apoio:**  
- GOD Ideas Agent (para transformar insights em ideias),
- Catalyst (para repensar arquitetura se necessário).

**Atividades típicas:**
- Ler métricas de uso,
- Identificar gargalos e erros,
- Apontar oportunidades de melhoria,
- Gerar relatórios e resumos para o GOD user.

**Saída:**  
- Insights,
- Problemas identificados,
- Recomendações de melhorias → novas ideias para o backlog.

---

### Fase 8 – Evolução Contínua

**Entrada:**  
- Novas ideias derivadas da operação e do uso.

**Agentes principais:**  
- GOD Ideas Agent,
- Catalyst Agent,
- Agents Architect (quando envolver agentes).

**Atividades típicas:**
- Repetir o ciclo:
  - refinar ideias,
  - redesenhar módulos,
  - criar/evoluir agentes,
  - refatorar código,
  - melhorar UX, documentação, etc.

**Saída:**  
- Releases sucessivas,
- Sistemas e agentes cada vez mais maduros.

---

## 2. Ciclo em Forma Resumida

```text
Insight
  ↓
Idea registrada (GOD Ideas)
  ↓
Clarificação & Priorização
  ↓
Design & Arquitetura (Catalyst)
  ↓
Planejamento de Execução
  ↓
Implementação (Code Assistant)
  ↓
Documentação (Docs Agent)
  ↓
Deploy & Operação
  ↓
Observação & Insights (Ops Agent)
  ↓
Novas Ideias
  ↓
(recomeça)
```

---

## 3. Como usar este documento

- Como referência para o GOD user entender “em que fase estamos”.
- Como mapa para os agentes:
  - GOD Ideas sabe onde entra,
  - Catalyst sabe quando deve ser acionado,
  - Code Assistant sabe que não é “o primeiro da fila”,
  - Ops Agent sabe que alimenta o ciclo.
- Como base para dashboards futuros do próprio Agents Hub (ex.: status dos projetos por fase).
