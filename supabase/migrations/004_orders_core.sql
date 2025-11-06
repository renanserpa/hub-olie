-- Olie Hub - Migração 004: Orders Core System
-- Conforme "vNova Base 2025" (Núcleo operacional e FSM)

BEGIN;

-- 1. Criação do ENUM para a FSM do Pedido
CREATE TYPE public.order_status_fsm AS ENUM (
    'pending_payment',
    'paid',
    'in_production',
    'awaiting_shipping',
    'shipped',
    'delivered',
    'cancelled'
);

-- 2. Tabela de Clientes
CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.customers IS 'Cadastro de clientes.';

-- 3. Tabela de Pedidos (Orders)
CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid REFERENCES public.customers(id),
    status public.order_status_fsm NOT NULL DEFAULT 'pending_payment',
    total_amount NUMERIC(12, 2) NOT NULL,
    shipping_address_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.orders IS 'Núcleo operacional de vendas e FSM principal.';
-- Adiciona FK para Orders na Production_Orders (Migração 003)
ALTER TABLE public.production_orders ADD CONSTRAINT fk_order_id FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE RESTRICT;

-- 4. Tabela de Itens do Pedido
CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    variante_id uuid NOT NULL REFERENCES public.variante(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL
);
COMMENT ON TABLE public.order_items IS 'Itens individuais comprados (SKUs).';

-- 5. Correção de ItemPersonalizacao (Ligação ao Pedido)
-- Adiciona a FK correta à tabela de Personalização (Migração 001)
ALTER TABLE public.item_personalizacao
ADD CONSTRAINT fk_order_item_id
FOREIGN KEY (order_item_id)
REFERENCES public.order_items(id)
ON DELETE CASCADE;

-- 6. Tabela de Pagamentos do Pedido
CREATE TYPE public.payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TABLE public.order_payments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    status public.payment_status NOT NULL DEFAULT 'pending',
    transaction_id TEXT,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.order_payments IS 'Log de transações de pagamento (captura).';

-- 7. Tabela de Linha do Tempo (Auditoria)
CREATE TABLE public.order_timeline (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status_from public.order_status_fsm,
    status_to public.order_status_fsm NOT NULL,
    changed_by_user_id uuid, -- Referencia auth.users
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.order_timeline IS 'Log de auditoria das mudanças de status.';

-- 8. Função Trigger: Cria OP quando o Pedido é Pago (Venda -> Produção)
CREATE OR REPLACE FUNCTION public.create_production_order_on_paid()
RETURNS TRIGGER AS $$
DECLARE
    v_bom_id uuid;
    v_mold_id uuid;
    v_first_variante_id uuid;
BEGIN
    -- Só executa quando o status muda PARA 'paid'
    IF NEW.status = 'paid' AND OLD.status IS DISTINCT FROM 'paid' THEN
        
        -- 1. Encontra a primeira Variante no pedido
        SELECT variante_id INTO v_first_variante_id
        FROM public.order_items WHERE order_id = NEW.id LIMIT 1;

        -- 2. Busca a BOM e o Molde mais recente/ativo para essa Variante (DNA OLIE)
        SELECT b.id, m.id INTO v_bom_id, v_mold_id
        FROM public.variante v
        JOIN public.produto p ON v.produto_id = p.id
        -- NOTA: Supondo que BOM/Moldes se ligam ao Produto (Peça-Base) para simplificar a busca
        -- Usaríamos uma tabela de associação se BOM/MOLD fossem por Variante específica
        LIMIT 1; 

        -- 3. Cria o registro em production_orders (P3)
        IF v_first_variante_id IS NOT NULL THEN
            INSERT INTO public.production_orders (order_id, status, bom_id, mold_id)
            VALUES (NEW.id, 'pending', v_bom_id, v_mold_id)
            ON CONFLICT (order_id) DO NOTHING; -- Evita duplicidade
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Criação do Trigger
CREATE TRIGGER on_order_status_update_create_op
AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.create_production_order_on_paid();


-- 10. Habilitação de RLS (Item 7)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;

-- 11. Políticas de RLS (Item 7)
-- AdminGeral, Administrativo, Vendas, Conteudo: Acesso Total (Vendas/Atendimento)
CREATE POLICY "RLS: Sales Admins - Acesso Total (Customers)" ON public.customers FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo', 'Vendas', 'Conteudo') );
CREATE POLICY "RLS: Sales Admins - Acesso Total (Orders)" ON public.orders FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo', 'Vendas', 'Conteudo') );
CREATE POLICY "RLS: Sales Admins - Acesso Total (Items)" ON public.order_items FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo', 'Vendas', 'Conteudo') );
CREATE POLICY "RLS: Sales Admins - Acesso Total (Payments)" ON public.order_payments FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo', 'Vendas', 'Conteudo') );
CREATE POLICY "RLS: Sales Admins - Acesso Total (Timeline)" ON public.order_timeline FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo', 'Vendas', 'Conteudo') );

-- Producao: Leitura (SELECT)
CREATE POLICY "RLS: Producao - Acesso Leitura (Orders/Items/Customers)" ON public.orders FOR SELECT USING ( (auth.jwt() ->> 'role') = 'Producao' );
CREATE POLICY "RLS: Producao - Acesso Leitura (order_items)" ON public.order_items FOR SELECT USING ( (auth.jwt() ->> 'role') = 'Producao' );

-- Financeiro: Leitura (SELECT)
CREATE POLICY "RLS: Financeiro - Acesso Leitura (Orders/Payments)" ON public.orders FOR SELECT USING ( (auth.jwt() ->> 'role') = 'Financeiro' );
CREATE POLICY "RLS: Financeiro - Acesso Leitura (order_payments)" ON public.order_payments FOR SELECT USING ( (auth.jwt() ->> 'role') = 'Financeiro' );


COMMIT;
