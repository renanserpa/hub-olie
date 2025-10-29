
# Relatório de Migração e Análise Comparativa: Orders v3.0

**Executor:** Arquiteto-Executor Sênior (Crew-Gemini)
**Data:** 2024-07-29

## 1. Objetivo

Este documento detalha o processo de consolidação das versões 1.0 e 2.0 do Módulo de Pedidos (`Orders`) para criar a versão 3.0. O objetivo é unificar a robusta capacidade de integração da v1 com a arquitetura de dados e interface de usuário avançada da v2, resultando em um módulo coeso, funcional e escalável.

## 2. Análise Comparativa: v1 vs. v2

| Característica | Versão 1.0 (O que foi mantido) | Versão 2.0 (O que foi incorporado) | Consolidação na v3.0 |
| :--- | :--- | :--- | :--- |
| **Estrutura de Dados** | JSONB (`payments`, `fiscal`, `logistics`) para dados de integrações. | Tabelas normalizadas (`order_items`, `order_payments`, `order_timeline`, `order_notes`). | **Estrutura Híbrida:** A base é o modelo normalizado da v2 para escalabilidade. Os campos JSONB da v1 foram mantidos na tabela `orders` para armazenar os retornos das integrações Tiny, servindo como um cache rápido. |
| **Criação de Pedido** | `OrderDialog` modal, completo, com seleção de cliente e itens. | Foco na visualização, criação não detalhada. | **Modelo v1 Mantido:** O `OrderDialog` foi preservado como a principal ferramenta para a criação de novos pedidos, por ser mais direto e funcional. |
| **Visualização/Edição** | `OrderDetail` em tela cheia com abas para integrações. | `OrderDrawer` lateral com abas para `Detalhes`, `Itens`, `Pagamentos`, `Timeline`, `Notas`. | **Modelo v2 Adotado:** O `OrderDrawer` foi adotado como a interface padrão para visualização e edição, por ser mais moderno e não interromper o fluxo do usuário. As abas de integração da v1 foram incorporadas nele. |
| **Visão Geral** | Lista simples com filtros básicos. | Board Kanban com 6 colunas e drag-and-drop (`@dnd-kit`). | **Ambos Mantidos:** A página principal agora possui um seletor de visualização, permitindo ao usuário alternar entre o `OrdersBoard` (Kanban) da v2 e uma visualização em lista, oferecendo flexibilidade. |
| **Integrações (Tiny)** | **Base do v3:** `useTinyApi` e lógica para chamar Edge Functions (`payments`, `nfe`, `shipping`). | Foco em dados internos, sem integrações externas. | **Modelo v1 Mantido e Integrado:** O `useTinyApi` foi mantido intacto. Os botões que disparam suas funções foram movidos para dentro das abas contextuais do `OrderDrawer` da v2. |
| **Timeline e Notas** | Não existente. | Implementação completa com tabelas `order_timeline`, `order_notes`, `order_attachments`. | **Modelo v2 Adotado:** Toda a funcionalidade de timeline, notas e anexos foi incorporada na v3. A timeline é atualizada automaticamente após as ações de integração da v1. |
| **Hooks de Dados** | `useOrders` simples para buscar a lista. | `useOrders` complexo com filtros, ordenação e estado. | **Consolidado:** O `useOrders` foi reescrito para ser o cérebro do módulo, incorporando os filtros avançados da v2 e as funções de mutação que interagem com as integrações da v1. |
| **Segurança (RLS)** | Políticas básicas. | Políticas detalhadas por tabela, bloqueio de `DELETE`. | **Modelo v2 Adotado:** As políticas de RLS mais granulares da v2 foram aplicadas a todas as novas tabelas (`order_items`, `order_timeline`, etc.). |

## 3. Estratégia de Unificação para a Versão 3.0

-   **Componente Orquestrador (`pages/OrdersPage.tsx`):** Um novo componente de página foi criado para gerenciar o estado da visualização (Kanban/Lista) e a abertura do `OrderDrawer` (para edição) e do `OrderDialog` (para criação).
-   **Centralização da Lógica (`hooks/useOrders.ts`):** Toda a lógica de busca, filtragem e atualização de dados foi consolidada neste hook, que se torna a única fonte da verdade para a UI. Ele é responsável por buscar dados de todas as tabelas relacionadas (`orders`, `order_items`, etc.) e montá-los.
-   **Preservação da Camada de Integração (`hooks/useTinyApi.ts`):** O hook de integrações foi mantido separado para manter o baixo acoplamento. Ele é invocado pelos componentes da UI (dentro do Drawer) e, em caso de sucesso, chama uma função do `useOrders` para atualizar o estado do pedido e registrar na timeline.
-   **Validação Robusta (`lib/schemas/order.ts`):** Para aumentar a robustez, schemas de validação Zod foram introduzidos (prática inspirada na v2) para garantir a integridade dos dados antes de serem enviados ao banco.

## 4. Próximos Passos: Migração Incremental

A versão 3.0 está funcional com o schema unificado. Para habilitar todas as funcionalidades, a seguinte sequência de migrações no banco de dados Supabase é recomendada:

1.  **Habilitar Tabelas Base:**
    -   Verificar se `orders` e `order_items` existem e estão alinhadas.
2.  **Habilitar Auditoria e Interação:**
    -   `CREATE TABLE public.order_timeline (...)`
    -   `CREATE TABLE public.order_notes (...)`
    -   `CREATE TABLE public.order_attachments (...)`
3.  **Habilitar Detalhes de Pagamento:**
    -   `CREATE TABLE public.order_payments (...)`
4.  **Habilitar Integração com Produção:**
    -   `CREATE TABLE public.order_production_items (...)`

O `dataService` e o `useOrders` já estão preparados para detectar a ausência dessas tabelas, garantindo que a aplicação não quebre e registrando no console quais migrações estão pendentes.
