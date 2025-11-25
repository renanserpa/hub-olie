# OlieHub – Plano de Ação DB (Fase 1)

## 1. Objetivos
- Alinhar o schema com o frontend atual (tabelas no plural e colunas esperadas em `src/types.ts`).
- Garantir multi-tenant via `organization_id` em todas as tabelas de domínio.
- Habilitar RLS mínimo em `orders`, `order_items`, `customers`, `production_orders`, `inventory_items`, `inventory_movements` com vínculo ao usuário via `user_organization_role`.

## 2. Alterações de Schema Propostas

### [OBRIGATÓRIA] Base de tenants e papéis
- Tabelas: `organizations`, `user_organization_role`.
- Descrição: criar base mínima para multi-tenant, vinculando usuários a organizações.
- SQL sugerido:
```sql
-- SUGESTÃO PARA DBA: criar base de tenants
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_organization_role (
  user_id uuid NOT NULL,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, organization_id)
);
```

### [OBRIGATÓRIA] Customers
- Tabela: `customers`.
- Descrição: garantir colunas esperadas pelo frontend (nome, contato, organização).
- SQL sugerido:
```sql
-- SUGESTÃO PARA DBA: ajustar/garantir customers
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS customers_org_idx ON public.customers (organization_id, created_at DESC);
```

### [OBRIGATÓRIA] Orders e Order Items
- Tabelas: `orders`, `order_items`.
- Descrição: alinhar pedidos com totais e status, e itens com valores unitários.
- SQL sugerido:
```sql
-- SUGESTÃO PARA DBA: ajustar/garantir orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  code text,
  status text NOT NULL DEFAULT 'draft',
  order_date date DEFAULT now(),
  due_date date,
  total_gross_amount numeric(12,2) NOT NULL DEFAULT 0,
  total_net_amount numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_org_status_idx ON public.orders (organization_id, status, order_date DESC);

-- SUGESTÃO PARA DBA: ajustar/garantir order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  quantity numeric(12,2) NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  total_amount numeric(12,2) NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS order_items_org_order_idx ON public.order_items (organization_id, order_id);
```

### [OBRIGATÓRIA] Production Orders
- Tabela: `production_orders`.
- Descrição: suportar planejamento e vínculo opcional ao pedido.
- SQL sugerido:
```sql
-- SUGESTÃO PARA DBA: ajustar/garantir production_orders
CREATE TABLE IF NOT EXISTS public.production_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  code text,
  status text NOT NULL DEFAULT 'planned',
  priority integer NOT NULL DEFAULT 0,
  planned_start_date date,
  planned_end_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS production_orders_org_status_idx ON public.production_orders (organization_id, status, priority DESC);
```

### [OBRIGATÓRIA] Inventory
- Tabelas: `inventory_items`, `inventory_movements`.
- Descrição: catálogo de insumos e ledger de movimentos.
- SQL sugerido:
```sql
-- SUGESTÃO PARA DBA: ajustar/garantir inventory_items
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  sku text,
  quantity numeric(14,4) NOT NULL DEFAULT 0,
  unit text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS inventory_items_org_sku_uidx ON public.inventory_items (organization_id, sku) WHERE sku IS NOT NULL;

-- SUGESTÃO PARA DBA: ajustar/garantir inventory_movements
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  movement_type text NOT NULL,
  quantity numeric(14,4) NOT NULL,
  related_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS inventory_movements_org_item_idx ON public.inventory_movements (organization_id, item_id, created_at DESC);
```

### [OPCIONAL] Triggers de atualização de timestamp
- Tabelas: `orders`, `production_orders`.
- Descrição: manter `updated_at` sincronizado automaticamente.
- SQL sugerido:
```sql
-- SUGESTÃO PARA DBA: trigger de updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_orders'
  ) THEN
    CREATE TRIGGER set_updated_at_orders
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_production_orders'
  ) THEN
    CREATE TRIGGER set_updated_at_production_orders
    BEFORE UPDATE ON public.production_orders
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END$$;
```

## 3. RLS & Segurança

### Policies recomendadas (todas marcadas para revisão manual)
- Todas as tabelas críticas devem ter RLS habilitado.
- Exemplo de policies (ajustar nomes conforme existente):
```sql
-- SUGESTÃO PARA DBA: habilitar RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_organization_role ENABLE ROW LEVEL SECURITY;

-- SUGESTÃO PARA DBA: policies por organização
CREATE POLICY IF NOT EXISTS "customers_select_by_org" ON public.customers
FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.user_organization_role WHERE user_id = auth.uid()));
CREATE POLICY IF NOT EXISTS "customers_write_by_org" ON public.customers
FOR ALL USING (organization_id IN (SELECT organization_id FROM public.user_organization_role WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM public.user_organization_role WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS "orders_select_by_org" ON public.orders
FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.user_organization_role WHERE user_id = auth.uid()));
CREATE POLICY IF NOT EXISTS "orders_write_by_org" ON public.orders
FOR ALL USING (organization_id IN (SELECT organization_id FROM public.user_organization_role WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM public.user_organization_role WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS "order_items_select_by_org" ON public.order_items
FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.user_organization_role WHERE user_id = auth.uid()));
CREATE POLICY IF NOT EXISTS "order_items_write_by_org" ON public.order_items
FOR ALL USING (organization_id IN (SELECT organization_id FROM public.user_organization_role WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM public.user_organization_role WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS "production_orders_select_by_org" ON public.production_orders
FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.user_organization_role WHERE user_id = auth.uid()));
CREATE POLICY IF NOT EXISTS "production_orders_write_by_org" ON public.production_orders
FOR ALL USING (organization_id IN (SELECT organization_id FROM public.user_organization_role WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM public.user_organization_role WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS "inventory_items_select_by_org" ON public.inventory_items
FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.user_organization_role WHERE user_id = auth.uid()));
CREATE POLICY IF NOT EXISTS "inventory_items_write_by_org" ON public.inventory_items
FOR ALL USING (organization_id IN (SELECT organization_id FROM public.user_organization_role WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM public.user_organization_role WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS "inventory_movements_select_by_org" ON public.inventory_movements
FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.user_organization_role WHERE user_id = auth.uid()));
CREATE POLICY IF NOT EXISTS "inventory_movements_write_by_org" ON public.inventory_movements
FOR ALL USING (organization_id IN (SELECT organization_id FROM public.user_organization_role WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM public.user_organization_role WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS "user_org_role_self" ON public.user_organization_role
FOR SELECT USING (user_id = auth.uid());
```

## 4. Observações
- Todas as instruções acima são sugestões e devem ser revisadas antes de rodar em produção.
- Evitar alterações destrutivas; caso o schema existente difira, avaliar migrações incrementais (ADD COLUMN IF NOT EXISTS, UPDATE de dados). 
- Após aplicar, validar RLS com usuários de diferentes organizações para confirmar isolamento.
