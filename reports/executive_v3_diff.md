# Documentação Técnica do Módulo: Diretoria (Executive Dashboard) v3.0

**Versão:** 3.0 (Implantação Base)
**Data:** 2024-07-31
**Responsável:** 🧠 ArquitetoSupremo (Crew-Gemini)
**Arquivo Fonte:** `/reports/executive_v3_diff.md`

---

## 1. Visão Geral

O Módulo de Diretoria é o painel de controle estratégico de mais alto nível do Olie Hub. Ele foi projetado para consolidar os indicadores-chave de performance (KPIs) de todas as áreas do negócio (Vendas, Produção, Financeiro, etc.) em uma visão concisa e de fácil digestão para a liderança (C-level). Sua principal diferenciação é a camada de inteligência artificial, que não apenas exibe dados, mas os interpreta para gerar insights, identificar riscos e apontar oportunidades estratégicas.

-   **Objetivo Operacional:** Fornecer um panorama rápido e acionável da saúde da empresa, comparando a performance atual com períodos anteriores e facilitando a tomada de decisão estratégica com base em dados consolidados e análises qualitativas geradas por IA.
-   **Papéis Envolvidos:**
    -   `AdminGeral`: Acesso total ao dashboard, incluindo a capacidade de gerar novas análises de IA.
    -   Outros papéis de liderança (futuro): Acesso de leitura a painéis específicos.

---

## 2. Estrutura de Dados

A arquitetura de dados é otimizada para performance e clareza, utilizando tabelas pré-agregadas que são atualizadas por processos de backend, em vez de cálculos em tempo real. **Nenhuma das tabelas a seguir existe no schema de produção; elas foram implementadas no sandbox para guiar o desenvolvimento.**

### Tabelas Principais (Implementadas no Sandbox)

| Tabela | Descrição |
| :--- | :--- |
| `executive_kpis` | Armazena os valores consolidados e pré-calculados dos KPIs estratégicos, geralmente agregados por trimestre. |
| `executive_ai_insights`| Registra os insights gerados pela IA, categorizados por tipo (risco, oportunidade, positivo). |

### Campos-Chave

#### `executive_kpis`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `uuid` | Chave primária. |
| `module` | `text` | Módulo de origem do KPI (ex: 'sales', 'financial'). |
| `name` | `text` | Nome do KPI (ex: 'Faturamento Total'). |
| `value` | `numeric` | Valor consolidado do KPI para o período. |
| `trend` | `numeric` | Variação percentual em relação ao período anterior (ex: 0.12 para +12%). |
| `period` | `text` | Período de referência (ex: 'Q4 2024'). |

#### `executive_ai_insights`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `uuid` | Chave primária. |
| `module` | `text` | Módulo relacionado ao insight. |
| `type` | `text` | Tipo de insight: 'opportunity', 'positive', 'risk'. |
| `insight`| `text` | O texto do insight gerado pela IA. |
| `period` | `text` | Período de referência. |

### Diagrama de Relacionamento (ERD) Proposto

```mermaid
erDiagram
    subgraph Módulo de Analytics
        analytics_kpis
    end
    
    subgraph Sistema de Agregação (Backend)
        A["Cron Job / Edge Function"]
    end

    subgraph Módulo de Diretoria (DB)
        executive_kpis
        executive_ai_insights
    end

    analytics_kpis -- "consolida" --> A
    A -- "atualiza periodicamente" --> executive_kpis
    executive_kpis -- "é analisado por" --> A
    A -- "gera" --> executive_ai_insights

    executive_kpis {
        uuid id PK
        text module
        text name
        numeric value
        numeric trend
        text period
    }
    executive_ai_insights {
        uuid id PK
        text type
        text insight
    }
```

---

## 3. Regras de Negócio & RLS (Propostos)

### Políticas de Acesso (RLS)
| Papel | Permissões em `executive_*` |
| :--- | :--- |
| `AdminGeral` | `SELECT` em tudo. `INSERT`/`UPDATE` via funções seguras de backend. |
| Outros | Acesso negado. |

### Lógica Central
-   **Dados Pré-Agregados:** Os KPIs deste módulo são de natureza estratégica e não precisam de atualização em tempo real. Eles devem ser calculados e atualizados por um processo de backend (ex: uma Supabase Edge Function agendada) em uma frequência mais baixa (diária, semanal ou mensal), lendo dados do módulo de Analytics ou diretamente das tabelas operacionais.
-   **Geração de Insights:** A análise da IA é acionada sob demanda pelo usuário na UI. O `geminiService` recebe o conjunto atual de KPIs, realiza a análise e retorna um resumo qualitativo. Os insights mais relevantes podem ser salvos na tabela `executive_ai_insights`.

---

## 4. Fluxos Operacionais

O fluxo de dados é de consolidação e apresentação, com uma camada de inteligência sob demanda.

```mermaid
graph TD
    A[Dados Operacionais e de Analytics] --> B{Processo de Agregação (Backend)};
    B -- "Agendado (ex: diário)" --> C[Tabela `executive_kpis`];
    
    subgraph Olie Hub UI - Dashboard Executivo
        D[Usuário acessa o dashboard] --> E{Hook `useExecutiveDashboard`};
        E -- "SELECT *" --> C;
        C --> F[Renderiza `ExecutiveKpiCard`s];
        
        G[Usuário clica em "Gerar Resumo"] --> H{Chama `geminiService` com KPIs};
        H --> I[Exibe Análise da IA];
    end
```

---

## 5. KPIs & Métricas

Este módulo exibe os KPIs mais estratégicos da empresa, como:
-   Faturamento Total
-   Lucro Líquido
-   Eficiência Produtiva
-   OTIF (On-Time In-Full)
-   Custo de Matéria-Prima
-   Retorno sobre Investimento (ROI)

---

## 6. Critérios de Aceite

-   [✅] O dashboard exibe abas para cada pilar do negócio (Visão Geral, Financeiro, Vendas, etc.).
-   [✅] Os `ExecutiveKpiCard`s são renderizados com dados das tabelas do sandbox, formatando valores de forma compacta (ex: 1.25M).
-   [✅] A funcionalidade de "Gerar Novo Resumo" com IA está funcional, enviando os KPIs para o `geminiService` e exibindo o resultado.
-   [✅] A UI é resiliente e exibe estados de "Sem Dados" (`EmptyState`) se as tabelas estiverem vazias.
-   [ ] **Pendente:** As tabelas `executive_kpis` e `executive_ai_insights` existem no ambiente de produção.
-   [ ] **Pendente:** O processo de backend para agregação e atualização periódica dos `executive_kpis` está implementado.
-   [ ] **Pendente:** A geração de relatórios em PDF está funcional.

---

## 7. Auditoria Técnica (Diff) - Implantação v3.0

Esta é a primeira implementação formal do Módulo de Diretoria, estabelecendo a camada de inteligência de negócios mais alta da plataforma.

-   **Diferenciação do Módulo Analytics:** Enquanto o Módulo de Analytics foca em dados operacionais e em tempo real para gerentes, o Dashboard Executivo foca em dados estratégicos, pré-agregados e de baixa frequência (trimestral, mensal) para a diretoria. A formatação de valores e a natureza dos KPIs refletem essa diferença.
-   **Core Feature - IA:** A principal inovação é a integração direta com a IA Generativa (Gemini) para transformar dados quantitativos em insights qualitativos e acionáveis. Isso move o dashboard de uma ferramenta de "o que aconteceu" para uma de "o que isso significa e o que devemos fazer".
-   **Arquitetura Resiliente:** A implementação no sandbox (`sandboxDb.ts`) das tabelas `executive_kpis` e `executive_ai_insights` permitiu o desenvolvimento completo da UI e da lógica de IA. O hook `useExecutiveDashboard` é projetado para lidar com a ausência dessas tabelas em produção, guiando a equipe de dados sobre quais migrações são necessárias.

---

## 8. Ações Recomendadas / Pendentes

1.  **[ALTA] Criar Schema no Supabase:** Criar as tabelas `public.executive_kpis` e `public.executive_ai_insights` no ambiente de produção.
2.  **[MÉDIA] Implementar Job de Agregação:** Desenvolver e agendar uma Supabase Edge Function para consolidar os dados do Módulo de Analytics (ou outras fontes) e atualizar a tabela `executive_kpis` em uma base regular (ex: diariamente).
3.  **[MÉDIA] Implementar Histórico de KPIs:** Criar a tabela `executive_snapshots` para armazenar o histórico de KPIs e desenvolver a lógica nos `ExecutiveChartCard`s para exibir gráficos de tendência comparando diferentes períodos.
4.  **[BAIXA] Desenvolver Geração de Relatórios:** Implementar a funcionalidade de exportação de relatórios em PDF, que consolida os KPIs, gráficos e insights da IA em um documento compartilhável.