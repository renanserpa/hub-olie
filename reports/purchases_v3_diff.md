# Relatório de Migração e Análise Comparativa: Purchasing v3.0

**Executor:** Arquiteto-Executor Sênior (Crew-Gemini)
**Data:** 2024-07-30

## 1. Objetivo

Este documento detalha a implementação do Módulo de Compras (Purchasing) v3.0. O objetivo é consolidar a gestão de fornecedores, ordens de compra (POs) e o ciclo de recebimento de materiais em uma única interface modular, resiliente e totalmente integrada ao ecossistema Olie Hub.

## 2. Arquitetura e Estrutura

A v3 introduz uma arquitetura completa, baseada em abas, para organizar o fluxo de suprimentos:

-   **Fornecedores:** Cadastro centralizado de fornecedores, com informações de contato, termos de pagamento, lead time e rating de performance.
-   **Pedidos de Compra (POs):** O coração do módulo. Permite a criação de POs, adição de itens (materiais básicos), emissão para o fornecedor, e acompanhamento de status.
-   **Métricas:** Um dashboard para análise de performance de compras, incluindo gastos, lead time médio, e performance de fornecedores.

## 3. Principais Componentes e Funcionalidades

-   **`SuppliersTable` & `SupplierDialog`:** Interface de CRUD completa para a gestão de fornecedores, com validação de dados via Zod e integrações (ex: ViaCEP).
-   **`POList` & `PODetailPanel`:** Layout de duas colunas para visualização e gerenciamento de Pedidos de Compra. Permite selecionar uma PO na lista e ver seus detalhes, itens e histórico no painel lateral.
-   **Ciclo de Vida da PO:** O sistema gerencia o ciclo de vida completo de uma PO, desde o `rascunho` (draft), passando por `emitida` (issued), `recebida parcialmente` (partial), `recebida` (received) e `cancelada` (canceled).
-   **Diálogos de Ação (`CreatePODialog`, `ReceivePODialog`):** Modais específicos guiam o usuário através das ações-chave: criar uma nova PO selecionando itens, e registrar o recebimento de materiais, atualizando o estoque.
-   **Hook Central (`usePurchasing`):** Orquestra todos os dados do módulo, gerenciando o estado de fornecedores, POs, filtros, seleções e todas as lógicas de mutação (criar, atualizar, emitir, receber).
-   **Resiliência Sandbox:** O módulo é totalmente funcional no modo sandbox, utilizando dados mock para todas as tabelas (`suppliers`, `purchase_orders`, `purchase_order_items`) e emitindo logs claros no console sobre o status das tabelas.

## 4. Integração com o Ecossistema Olie Hub

-   **Estoque (`Inventory`):** A integração mais crítica. Ao receber materiais de uma PO através do `ReceivePODialog`, o sistema irá (futuramente) registrar um `inventory_movement` do tipo 'entrada por compra', atualizando automaticamente o saldo do material.
-   **Financeiro (`Finance`):** Quando uma PO é emitida, ela representa uma conta a pagar. Esta informação será integrada ao módulo Financeiro para controle de fluxo de caixa.
-   **Produção (`Production`):** Os materiais básicos necessários para as ordens de produção podem ser rastreados até seus fornecedores preferenciais, otimizando o processo de reposição.
-   **Configurações (`Settings`):** Os materiais disponíveis para compra são originados do catálogo de `materiais_basicos` gerenciado nas Configurações.

## 5. Próximos Passos: Migração e Aprofundamento

A v3 foi implementada com uma base funcional sólida. Os próximos passos envolvem a migração para o Supabase real e o aprofundamento das integrações:

1.  **Habilitar Tabelas no Supabase:**
    -   `CREATE TABLE public.suppliers (...)`
    -   `CREATE TABLE public.purchase_orders (...)`
    -   `CREATE TABLE public.purchase_order_items (...)`
    -   Aplicar as políticas de RLS para garantir a segurança dos dados.

2.  **Implementar Integração com Estoque:**
    -   No `usePurchasing`, dentro da função `receivePO`, adicionar a chamada ao `dataService.addInventoryMovement` para cada item recebido.

3.  **Implementar Integração com Financeiro:**
    -   Criar um `trigger` no Supabase ou uma lógica no hook para que, ao mudar o status de uma PO para `issued`, um registro correspondente seja criado na tabela `contas_a_pagar`.

4.  **Desenvolver Dashboard de Métricas:**
    -   Implementar os gráficos e KPIs no componente `PurchaseMetrics`, calculando dados como lead time médio, total gasto por fornecedor, e percentual de entregas no prazo.