-- OlieHub Phase 1 – Migration SUGERIDA pelo DB Agent
-- Necessário revisar manualmente antes de aplicar em produção.

-- Habilitar RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_organization_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Policies baseadas em organization_id
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

-- Policies de organizações e papéis
CREATE POLICY IF NOT EXISTS "organizations_select_by_membership" ON public.organizations
FOR SELECT USING (id IN (SELECT organization_id FROM public.user_organization_role WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS "user_org_role_self" ON public.user_organization_role
FOR SELECT USING (user_id = auth.uid());
