# Relatório de Auditoria de Schema - Olie Hub

**Data:** 2024-07-29
**Executor:** Crew-Gemini (Arquiteto-Executor Sênior)

## 1. Sumário Executivo

Esta auditoria foi executada para identificar e corrigir a causa raiz do erro `Failed to fetch`, que se originava de um desalinhamento crítico entre o código-fonte da aplicação React e o schema real do banco de dados Supabase.

O código continha múltiplas chamadas a tabelas, colunas e relacionamentos que **não existem** no banco de dados, resultando em falhas de rede. As correções focaram em blindar o serviço de dados para que ele **não quebre** ao encontrar essas inconsistências, retornando estados vazios e emitindo avisos no console.

## 2. Tabelas Inexistentes Referenciadas no Código

As seguintes tabelas eram consultadas pela aplicação, mas não existem no schema do Supabase (conforme `exports/schema.json`), causando erros `404 Not Found` que se manifestavam como `Failed to fetch`.

| Tabela Inexistente | Módulo Afetado | Arquivos Corrigidos | Solução Aplicada |
| :--- | :--- | :--- | :--- |
| `tasks` | Produção (Kanban) | `hooks/useProductionKanban.ts`, `services/supabaseService.ts` | A função `getTasks` agora retorna `Promise.resolve([])` e emite um `console.warn`. A UI exibe um estado vazio. |
| `task_statuses` | Produção (Kanban) | `hooks/useProductionKanban.ts`, `services/supabaseService.ts` | A função `getTaskStatuses` agora retorna `Promise.resolve([])` e emite um `console.warn`. A UI exibe um estado vazio. |
| `inventory_balances` | Estoque | `hooks/useInventory.ts`, `services/supabaseService.ts` | A função `getInventoryBalances` agora retorna `Promise.resolve([])` e emite um `console.warn`. A UI exibe um estado vazio. |
| `product_categories` | Produtos | `hooks/useProducts.ts`, `services/supabaseService.ts` | A função `getProductCategories` agora retorna `Promise.resolve([])`. O tipo `Product` foi ajustado para usar `category` (string) em vez de `category_id`. |
| `config_color_palettes` | Configurações | `services/supabaseService.ts` | A função `getSettings` foi refatorada para não consultar esta tabela. |
| `lining_colors` | Configurações | `services/supabaseService.ts` | A função `getSettings` foi refatorada para não consultar esta tabela. |
| `puller_colors` | Configurações | `services/supabaseService.ts` | A função `getSettings` foi refatorada para não consultar esta tabela. |
| `embroidery_colors`| Configurações | `services/supabaseService.ts` | A função `getSettings` foi refatorada para não consultar esta tabela. |
| `fabric_textures`| Configurações | `services/supabaseService.ts` | A função `getSettings` foi refatorada para não consultar esta tabela. |
| `system_settings` | Configurações | `services/supabaseService.ts` | A função `getSettings` foi refatorada para não consultar esta tabela. |


## 3. Relacionamentos (Joins) Inválidos

A auditoria identificou consultas que tentavam realizar `JOIN` em colunas ou tabelas que não possuem a relação esperada.

| Tabela Principal | Join Inválido | Arquivo Corrigido | Correção |
| :--- | :--- | :--- | :--- |
| `products` | `select('*, category(*)')` | `services/supabaseService.ts` (em `getProducts`) | A tabela `products` possui uma coluna de texto `category`, não uma chave estrangeira `category_id`. A consulta foi alterada para um simples `select('*')`. O tipo `Product` em `types.ts` foi ajustado para `category?: string`. |
| `orders` | `select('*, contacts(*)')` | `services/supabaseService.ts` (em `getOrders`) | A tabela `contacts` não existe. A referência correta é `customers`. A consulta foi corrigida para `select('*, customers(*)')`. |

## 4. Plano de Ação para Migrações Futuras (TODO)

Para restaurar a funcionalidade completa dos módulos afetados, as seguintes migrações de banco de dados são recomendadas:

1.  **Módulo de Produção (Kanban):**
    *   Criar a tabela `public.task_statuses` (`id`, `name`, `color`, `position`).
    *   Criar a tabela `public.tasks` (`id`, `title`, `status_id` (FK para `task_statuses`), `order_id` (FK para `orders`), `position`, etc.).
    *   Popular as tabelas com os status padrão de produção.

2.  **Módulo de Estoque:**
    *   Criar a tabela (ou `VIEW`) `public.inventory_balances`. Uma `VIEW` materializada que agrega os dados de `inventory_movements` por `material_id` seria a solução mais performática e consistente, eliminando a necessidade de `triggers` para manter a sincronia.

3.  **Módulo de Produtos:**
    *   Considerar a normalização do catálogo criando a tabela `public.product_categories`.
    *   Executar uma migração para adicionar a coluna `category_id` (FK) à tabela `products`, popular os dados a partir da coluna `category` (texto) existente, e então remover a coluna de texto.

Até que essas migrações sejam aplicadas, a aplicação permanecerá funcional, operando em modo de fallback com dados vazios para as seções afetadas.