# OlieHub – Diagnóstico do Schema Atual (DB) – Fase 1

## 1. Inventário de tabelas relevantes
Contexto: o repositório não contém migrations Supabase existentes (`supabase/migrations` ausente) e o arquivo `schema.sql` está ilegível/binário. O diagnóstico abaixo reflete apenas o que está versionado e o que o frontend espera.

- **organizations (ou equivalente)**
  - Colunas esperadas: `id uuid PK`, `name text NOT NULL`, `created_at timestamptz DEFAULT now()`.
  - `organization_id`: não se aplica (tabela raiz do tenant).
  - FKs: referenciada por todas as tabelas de domínio.
- **user_organization_role (ou equivalente)**
  - Colunas esperadas: `user_id uuid`, `organization_id uuid`, `role text DEFAULT 'member'`, `created_at timestamptz DEFAULT now()`.
  - PK sugerida: `(user_id, organization_id)`.
  - FKs: `organization_id` → organizations(id); `user_id` → auth.users(id).
- **customers**
  - Colunas esperadas: `id uuid PK`, `organization_id uuid NOT NULL`, `name text NOT NULL`, `email text`, `phone text`, `created_at timestamptz DEFAULT now()`.
  - FKs: `organization_id` → organizations(id).
- **orders**
  - Colunas esperadas: `id uuid PK`, `organization_id uuid NOT NULL`, `customer_id uuid NULL`, `code text`, `status text NOT NULL DEFAULT 'draft'`, `order_date date DEFAULT now()`, `due_date date`, `total_gross_amount numeric(12,2) DEFAULT 0`, `total_net_amount numeric(12,2) DEFAULT 0`, `created_at timestamptz DEFAULT now()`, `updated_at timestamptz DEFAULT now()`, `notes text`.
  - FKs: `organization_id` → organizations(id); `customer_id` → customers(id).
- **order_items**
  - Colunas esperadas: `id uuid PK`, `organization_id uuid NOT NULL`, `order_id uuid NOT NULL`, `product_name text NOT NULL`, `quantity numeric(12,2) NOT NULL DEFAULT 1`, `unit_price numeric(12,2) NOT NULL DEFAULT 0`, `total_amount numeric(12,2) NOT NULL DEFAULT 0`.
  - FKs: `order_id` → orders(id) ON DELETE CASCADE; `organization_id` → organizations(id).
- **production_orders**
  - Colunas esperadas: `id uuid PK`, `organization_id uuid NOT NULL`, `code text`, `status text NOT NULL DEFAULT 'planned'`, `priority integer NOT NULL DEFAULT 0`, `order_id uuid NULL`, `planned_start_date date`, `planned_end_date date`, `created_at timestamptz DEFAULT now()`, `updated_at timestamptz DEFAULT now()`, `notes text`.
  - FKs: `organization_id` → organizations(id); `order_id` → orders(id).
- **inventory_items**
  - Colunas esperadas: `id uuid PK`, `organization_id uuid NOT NULL`, `name text NOT NULL`, `sku text`, `quantity numeric(14,4) NOT NULL DEFAULT 0`, `unit text`, `created_at timestamptz DEFAULT now()`.
  - FKs: `organization_id` → organizations(id).
- **inventory_movements**
  - Colunas esperadas: `id uuid PK`, `organization_id uuid NOT NULL`, `item_id uuid NOT NULL`, `movement_type text NOT NULL` (por exemplo: 'in', 'out', 'adjustment'), `quantity numeric(14,4) NOT NULL`, `related_order_id uuid NULL`, `note text`, `created_at timestamptz DEFAULT now()`.
  - FKs: `item_id` → inventory_items(id); `organization_id` → organizations(id); `related_order_id` → orders(id).

## 2. Diferenças entre schema e frontend
- O frontend (vide `src/types.ts`) espera campos chave como `organization_id`, `status`, `created_at`, `planned_start`, `planned_end`, `sku`, `movement type`, etc. 【F:src/types.ts†L1-L54】
- Sem migrations ou schema legível no repositório, não há garantia de que as colunas existam conforme os tipos. Recomenda-se alinhar o schema às interfaces presentes no frontend.
- Campos ausentes mais sensíveis (comparando com `src/types.ts`):
  - **orders**: `status`, `total` (frontend usa `total`; sugerido mapear para `total_net_amount`), `created_at`.
  - **customers**: `name`, `email`, `phone`, `created_at`.
  - **production_orders**: `status`, `priority`, `planned_start`, `planned_end`.
  - **inventory_items**: `sku`, `quantity`.
  - **inventory_movements**: `type`, `quantity`, `created_at`.

## 3. Situação de RLS
- Não há evidência de políticas RLS versionadas (ausência de migrations e schema legível). Assim, assume-se:
  - RLS pode estar **desativado** ou incompleto para `orders`, `customers`, `production_orders`, `inventory_items`, `inventory_movements`.
  - Policies específicas por `organization_id` provavelmente estão ausentes ou não rastreadas.
- Recomenda-se habilitar RLS e criar policies que filtrem por `organization_id` vinculado ao usuário via `user_organization_role` antes de qualquer acesso em produção.
