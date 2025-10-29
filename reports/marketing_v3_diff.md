# Relatório de Migração e Análise Comparativa: Marketing v3.0

**Executor:** Arquiteto-Executor Sênior (Crew-Gemini)
**Data:** 2024-07-30

## 1. Objetivo

Este documento detalha a implementação do Módulo de Marketing v3.0, consolidando a gestão de campanhas, segmentação de público e templates de comunicação em uma única interface modular e integrada ao ecossistema Olie Hub.

## 2. Arquitetura e Estrutura

A v3 introduz uma arquitetura completa, baseada em abas, para organizar as diferentes facetas do marketing:

-   **Campanhas:** O coração do módulo. Permite a criação, gerenciamento e visualização de campanhas multicanal (Email, SMS, WhatsApp, Instagram).
-   **Segmentos:** Gerenciador de público-alvo, permitindo a criação de regras para segmentar a base de contatos (clientes).
-   **Templates:** Editor de conteúdo e mensagens reutilizáveis para as campanhas.
-   **Dashboard:** Painel de métricas e KPIs para análise de performance.

## 3. Principais Componentes e Funcionalidades

-   **`CampaignCard`:** Exibe um resumo visual de cada campanha, incluindo status, canais, e KPIs principais (taxa de abertura, cliques, ROI).
-   **`CampaignDialog`:** Formulário modal para criação e edição de campanhas, com validação de dados via Zod, agendamento, e definição de orçamento.
-   **Integração com IA (Gemini):** O `CampaignDialog` inclui uma funcionalidade para gerar descrições de campanha automaticamente, agilizando o processo criativo.
-   **Hook Central (`useMarketing`):** Orquestra todos os dados do módulo, gerenciando o estado de campanhas, segmentos e templates, além da lógica de filtros e mutações.
-   **Resiliência Sandbox:** O módulo é totalmente funcional no modo sandbox, utilizando dados mock e emitindo logs claros no console sobre o status das tabelas (`marketing_campaigns`, `marketing_segments`, etc.).

## 4. Integração com o Ecossistema Olie Hub

-   **Contatos (`Customers`):** O módulo de Segmentos se integrará diretamente com a base de contatos para criar públicos dinâmicos.
-   **Pedidos (`Orders`):** As campanhas poderão rastrear conversões (pedidos gerados) através de parâmetros UTM.
-   **Omnichannel:** No futuro, o envio real das mensagens (WhatsApp, etc.) será delegado ao módulo Omnichannel.
-   **Financeiro:** Os dados de `budget` e `spent` das campanhas serão integrados ao módulo Financeiro para cálculo preciso de ROI, CPA e CPC.

## 5. Próximos Passos: Migração Incremental

A v3 foi implementada com uma base sólida para as campanhas. Os próximos passos envolvem a implementação completa das funcionalidades de Segmentos, Templates e Dashboard:

1.  **Habilitar Tabelas no Supabase:**
    -   `CREATE TABLE public.marketing_campaigns (...)`
    -   `CREATE TABLE public.marketing_segments (...)`
    -   `CREATE TABLE public.marketing_templates (...)`
    -   `CREATE TABLE public.marketing_events (...)` (para tracking de métricas)

2.  **Desenvolver UI de Segmentação:**
    -   Implementar o construtor de regras de segmentação no componente `SegmentManager`.

3.  **Desenvolver UI de Templates:**
    -   Implementar o editor de templates no componente `TemplateEditor`, possivelmente com um editor visual (WYSIWYG).

4.  **Desenvolver Dashboard:**
    -   Implementar os gráficos e métricas no `DashboardPanel`, buscando dados de `marketing_events`.
