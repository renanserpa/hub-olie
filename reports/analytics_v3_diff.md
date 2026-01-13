# Documentação Técnica do Módulo: Analytics v3.0

**Versão:** 3.0 (Implantação Base)
**Data:** 2024-07-31
**Responsável:** 🧠 ArquitetoSupremo (Crew-Gemini)
**Arquivo Fonte:** `/reports/analytics_v3_diff.md`

---

## 1. Visão Geral

O Módulo de Analytics é o centro de Business Intelligence (BI) do Olie Hub. Sua função é agregar, processar e visualizar os dados operacionais de todos os outros módulos (Vendas, Produção, Estoque, etc.) em painéis de desempenho (dashboards) e relatórios. Ele transforma dados brutos em insights acionáveis, permitindo uma análise de tendências, identificação de gargalos e tomada de decisão estratégica baseada em dados.

-   **Objetivo Operacional:** Fornecer uma visão unificada e em tempo real da performance da empresa, monitorar Indicadores-Chave de Performance (KPIs) e facilitar a geração de relatórios gerenciais.
-   **Papéis Envolvidos:**
    -   `AdminGeral`: Acesso total a todos os dashboards e capacidade de criar relatórios customizados.
    -   `Financeiro`: Acesso a dashboards financeiros, de vendas e de custos.
    -   `Administrativo`: Acesso a dashboards operacionais (vendas, logística).

---

## 2. Estrutura de Dados

A arquitetura de dados da v3.0 foi projetada para performance, utilizando uma tabela pré-agregada (`analytics_kpis`) para evitar cálculos complexos em tempo real na interface do usuário.

### Tabelas Principais (Schema Ativo no Sandbox)

| Tabela | Descrição |
| :--- | :--- |
| `analytics_kpis` | Tabela central que armazena os valores calculados dos KPIs de todos os módulos. |

### Campos-Chave

#### `analytics_kpis`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `uuid` | Chave primária. |
| `module` | `text` | Módulo ao qual o KPI pertence (ex: 'orders', 'production'). |
| `name` | `text` | Nome legível do KPI (ex: 'Ticket Médio'). |
| `value` | `numeric` ou `text` | O valor atual do KPI. |
| `trend` | `numeric` | Variação percentual em relação ao período anterior (ex: 0.15 para +15%). |
| `unit` | `text` | Unidade de medida (ex: 'R$', '%', 'dias'). |
| `description`| `text` | Breve explicação do que o KPI representa. |

### Tabelas Planejadas (Não existentes no Schema atual)
-   `analytics_snapshots`: Armazena "fotos" diárias/mensais dos KPIs para análise histórica e de tendências.
-   `analytics_reports`: Salva configurações de relatórios customizados criados pelos usuários.

### Diagrama de Relacionamento (ERD) Proposto

```mermaid
erDiagram
    subgraph Módulos Operacionais
        orders
        production_orders
        inventory_movements
    end
    
    subgraph Sistema de Agregação
        A["Batch Job (Ex: Edge Function)"]
    end

    subgraph Módulo de Analytics
        analytics_kpis
    end

    orders -- "calcula" --> A
    production_orders -- "calcula" --> A
    inventory_movements -- "calcula" --> A
    A -- "atualiza" --> analytics_kpis

    analytics_kpis {
        uuid id PK
        text module
        text name
        numeric value
        numeric trend
    }
```

---

## 3. Regras de Negócio & RLS (Propostos)

### Políticas de Acesso (RLS)
| Papel | Permissões em `analytics_*` |
| :--- | :--- |
| `AdminGeral` | `SELECT` em tudo. `INSERT`/`UPDATE` via funções seguras. |
| `Financeiro` | `SELECT` em KPIs com `module` 'financial', 'orders', 'purchasing'. |
| `Administrativo`| `SELECT` em KPIs com `module` 'orders', 'logistics'. |
| Outros | Acesso de leitura aos KPIs de seus respectivos módulos. |

### Lógica Central
-   **Cálculo de KPIs:** A atualização dos KPIs na tabela `analytics_kpis` **não deve ser feita diretamente pela aplicação cliente**. A responsabilidade deve ser de um processo de backend (ex: uma Supabase Edge Function executada em um cronograma - `cron job`) que lê os dados das tabelas operacionais, realiza os cálculos e atualiza a tabela de KPIs. Isso garante performance e consistência.
-   **Resiliência:** O hook `useAnalytics` é projetado para carregar os dados da tabela `analytics_kpis`. Se a tabela não existir, ele retorna um array vazio e emite um aviso, permitindo que a UI exiba um estado de "Sem Dados" (`EmptyState`) em vez de quebrar.

---

## 4. Fluxos Operacionais

O fluxo de dados do Analytics é um fluxo de agregação e consumo.

```mermaid
graph TD
    A[Dados Operacionais (Pedidos, Produção, etc.)] --> B{Processo de ETL/Agregação};
    B -- "Execução Agendada (ex: a cada 1h)" --> C[Tabela `analytics_kpis`];
    
    subgraph Olie Hub UI
        D[Usuário acessa a página de Analytics] --> E{Hook `useAnalytics`};
        E -- "SELECT * FROM analytics_kpis" --> C;
        C -- "Retorna dados pré-calculados" --> F[Renderiza `KpiCard` e `ChartCard`];
    end
```

---

## 5. KPIs & Métricas

O próprio módulo é a representação dos KPIs. Exemplos-chave incluem:
-   **Vendas:** Faturamento Total, Ticket Médio, Total de Pedidos.
-   **Produção:** Eficiência da Produção, Throughput.
-   **Estoque:** Giro de Estoque, Valor em Estoque.
-   **Logística:** Custo de Frete, Entregas no Prazo (OTIF).
-   **Marketing:** ROI de Campanhas, Custo por Aquisição (CPA).

---

## 6. Critérios de Aceite

-   [✅] A UI do módulo exibe abas para cada área de negócio.
-   [✅] Os `KpiCard`s são renderizados corretamente com dados da tabela `analytics_kpis` do sandbox.
-   [✅] Os indicadores de tendência (setas e cores) funcionam com base no campo `trend`.
-   [ ] **Pendente:** A tabela `analytics_kpis` existe no ambiente de produção.
-   [ ] **Pendente:** Um processo de backend está implementado para atualizar os KPIs periodicamente.
-   [ ] **Pendente:** Os componentes `ChartCard` são substituídos por uma biblioteca de gráficos real, exibindo dados históricos.
-   [ ] **Pendente:** Os filtros de período (`TimeRangeSelector`) e customização de relatórios estão funcionais.

---

## 7. Auditoria Técnica (Diff) - Implantação v3.0

Esta é a primeira implementação formal do Módulo de Analytics, estabelecendo uma arquitetura escalável e performática.

-   **Arquitetura de Dados:** A decisão de usar uma tabela pré-agregada (`analytics_kpis`) em vez de calcular métricas "on-the-fly" é a principal escolha arquitetural. Isso garante que o carregamento dos dashboards seja extremamente rápido, mesmo com um grande volume de dados operacionais.
-   **Estrutura da UI:** A UI foi projetada de forma modular, com componentes reutilizáveis como `KpiCard` e `ModuleMetrics`, e uma navegação por abas que espelha a estrutura da empresa. Isso facilita a adição de novos painéis no futuro.
-   **Resiliência e Diagnóstico:** O hook `useAnalytics` verifica a existência dos dados e informa o usuário caso a tabela `analytics_kpis` esteja vazia ou ausente, guiando o administrador sobre os próximos passos.
-   **Placeholders Estratégicos:** Componentes como `ChartCard` e `FilterPanel` foram implementados como placeholders visuais. Isso permite que a estrutura da UI seja validada e o layout aprovado, enquanto a lógica mais complexa de visualização e filtragem de dados é desenvolvida em uma fase posterior.

---

## 8. Ações Recomendadas / Pendentes

1.  **[ALTA] Criar e Popular Tabela de KPIs:** Criar a tabela `public.analytics_kpis` no Supabase de produção e executar um script inicial para popular os KPIs com base nos dados existentes.
2.  **[MÉDIA] Implementar Job de Agregação:** Desenvolver uma Supabase Edge Function que execute em um cronograma (ex: a cada hora). Esta função será responsável por ler os dados das tabelas operacionais, calcular os KPIs e atualizar a tabela `analytics_kpis`.
3.  **[MÉDIA] Integrar Biblioteca de Gráficos:** Escolher e implementar uma biblioteca de gráficos (ex: Recharts, Chart.js) para substituir os placeholders `ChartCard`, exibindo dados históricos que serão buscados da futura tabela `analytics_snapshots`.
4.  **[BAIXA] Desenvolver Filtros e Relatórios:** Implementar a lógica para os componentes `FilterPanel`, `TimeRangeSelector`, `CustomReportDialog` e `AnalyticsExportDialog` para permitir a personalização e exportação dos dados.