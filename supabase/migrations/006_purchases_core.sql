-- Olie Hub - Migração 006: Purchases Core System
-- Conforme "vNova Base 2025" (Fluxo Compras -> Estoque -> Financeiro)

BEGIN;

-- 1. Tabela de Fornecedores
CREATE TABLE public.suppliers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.suppliers IS 'Cadastro de Fornecedores.';

-- 2. Criação de ENUM para a FSM da Ordem de Compra
CREATE TYPE public.purchase_order_status AS ENUM (
    'draft',
    'sent',
    'partially_received',
    'fully_received',
    'cancelled'
);

-- 3. Tabela de Ordens de Compra (POs)
CREATE TABLE public.purchase_orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    status public.purchase_order_status NOT NULL DEFAULT 'draft',
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.purchase_orders IS 'Ordem de Compra (PO).';

-- 4. Tabela de Itens da Ordem de Compra
CREATE TABLE public.purchase_order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_order_id uuid NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    -- Conforme DNA OLIE, POs compram INSUMOS
    raw_material_id uuid NOT NULL REFERENCES public.inventory_raw_materials(id) ON DELETE RESTRICT,
    quantity_ordered INT NOT NULL CHECK (quantity_ordered > 0),
    unit_cost NUMERIC(10, 2) NOT NULL
);
COMMENT ON TABLE public.purchase_order_items IS 'Itens da OC (ligados a Insumos).';

-- 5. Tabela de Recebimentos (Gatilho para Estoque)
CREATE TABLE public.purchase_order_receipts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    po_item_id uuid NOT NULL REFERENCES public.purchase_order_items(id) ON DELETE RESTRICT,
    quantity_received INT NOT NULL CHECK (quantity_received > 0),
    received_by_user_id uuid, -- auth.users
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.purchase_order_receipts IS 'Log de recebimento de itens da PO.';

-- 6. Tabela de Contas a Pagar (Para o Módulo Financeiro)
CREATE TABLE public.finance_payables (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_order_id uuid NOT NULL UNIQUE REFERENCES public.purchase_orders(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL,
    due_date DATE,
    status public.payable_receivable_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.finance_payables IS 'Rastreamento de obrigações com fornecedores.';


-- 7. Função Trigger 1: Cria Conta a Pagar quando a PO é 'sent'
CREATE OR REPLACE FUNCTION public.create_payable_on_po_sent()
RETURNS TRIGGER AS $$
DECLARE
    total_amount NUMERIC;
BEGIN
    -- Só executa quando o status muda PARA 'sent'
    IF NEW.status = 'sent' AND OLD.status IS DISTINCT FROM 'sent' THEN
        -- Calcula o valor total da PO (assumindo que já foi populada)
        SELECT COALESCE(SUM(poi.quantity_ordered * poi.unit_cost), 0)
        INTO total_amount
        FROM public.purchase_order_items poi
        WHERE poi.purchase_order_id = NEW.id;

        -- Cria a conta a pagar
        INSERT INTO public.finance_payables (purchase_order_id, amount, due_date, status)
        VALUES (NEW.id, total_amount, NEW.expected_delivery_date, 'open')
        ON CONFLICT (purchase_order_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Criação do Trigger 1
CREATE TRIGGER on_po_status_change_create_payable
AFTER UPDATE ON public.purchase_orders
FOR EACH ROW EXECUTE FUNCTION public.create_payable_on_po_sent();


-- 9. Função Trigger 2: Processa Recebimento (Compras -> Estoque)
CREATE OR REPLACE FUNCTION public.process_purchase_receipt()
RETURNS TRIGGER AS $$
DECLARE
    v_raw_material_id uuid;
    v_po_id uuid;
    total_ordered INT;
    total_received INT;
BEGIN
    -- Obter IDs do insumo e da PO
    SELECT poi.raw_material_id, poi.purchase_order_id
    INTO v_raw_material_id, v_po_id
    FROM public.purchase_order_items poi
    WHERE poi.id = NEW.po_item_id;

    -- Passo 1: Criar o registro em inventory_movements (Gatilho para P2)
    INSERT INTO public.inventory_movements (raw_material_id, movement_type, quantity, source_document_id)
    VALUES (v_raw_material_id, 'purchase_in', NEW.quantity_received, v_po_id);

    -- Passo 2: Atualizar o status da PO
    SELECT
        SUM(poi.quantity_ordered) INTO total_ordered
    FROM public.purchase_order_items poi
    WHERE poi.purchase_order_id = v_po_id;

    SELECT
        COALESCE(SUM(por.quantity_received), 0) INTO total_received
    FROM public.purchase_order_receipts por
    JOIN public.purchase_order_items poi_inner ON por.po_item_id = poi_inner.id
    WHERE poi_inner.purchase_order_id = v_po_id;
    
    -- Se o recebimento é total, atualiza o status macro
    IF total_received >= total_ordered THEN
        UPDATE public.purchase_orders SET status = 'fully_received', updated_at = NOW() WHERE id = v_po_id;
    ELSIF total_received > 0 THEN
        UPDATE public.purchase_orders SET status = 'partially_received', updated_at = NOW() WHERE id = v_po_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Criação do Trigger 2
CREATE TRIGGER on_purchase_receipt_insert
AFTER INSERT ON public.purchase_order_receipts
FOR EACH ROW EXECUTE FUNCTION public.process_purchase_receipt();


-- 11. Habilitação de RLS (Item 7)
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_payables ENABLE ROW LEVEL SECURITY;

-- 12. Políticas de RLS (Item 7)
-- AdminGeral, Administrativo, Financeiro: Acesso Total
CREATE POLICY "RLS: Admin Finance - Acesso Total (suppliers)" ON public.suppliers FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo', 'Financeiro') );
CREATE POLICY "RLS: Admin Finance - Acesso Total (POs)" ON public.purchase_orders FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo', 'Financeiro') );
CREATE POLICY "RLS: Admin Finance - Acesso Total (Items)" ON public.purchase_order_items FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo', 'Financeiro') );
CREATE POLICY "RLS: Admin Finance - Acesso Total (Receipts)" ON public.purchase_order_receipts FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo', 'Financeiro') );
CREATE POLICY "RLS: Admin Finance - Acesso Total (Payables)" ON public.finance_payables FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo', 'Financeiro') );

-- Producao: Apenas Leitura
CREATE POLICY "RLS: Producao - Acesso Leitura (POs)" ON public.purchase_orders FOR SELECT USING ( (auth.jwt() ->> 'role') = 'Producao' );


COMMIT;
