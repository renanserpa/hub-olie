-- Olie Hub - Migração 007: Logistics WMS Simplificado
-- Conforme "vNova Base 2025" (WMS Simplificado e Fluxo Produção -> Logística)

BEGIN;

-- 1. Tabela Mestre de Status dos Envios (Kanban de Expedição)
CREATE TABLE public.logistics_shipment_statuses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    sequence INT NOT NULL DEFAULT 0,
    is_initial_status BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.logistics_shipment_statuses IS 'Define as colunas do Kanban de Expedição.';

-- 2. Tabela de Envios (Logistics Shipments)
CREATE TABLE public.logistics_shipments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE RESTRICT,
    status_id uuid NOT NULL REFERENCES public.logistics_shipment_statuses(id) ON DELETE RESTRICT,
    tracking_code TEXT,
    shipping_label_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.logistics_shipments IS 'A entidade principal do envio (rastreio, etiqueta).';

-- 3. Tabela de Ondas de Picking (Picking Waves)
CREATE TABLE public.picking_waves (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_by_user_id uuid,
    status TEXT NOT NULL DEFAULT 'open', -- FSM simplificada
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.picking_waves IS 'Agrupa múltiplos pedidos para otimização da separação (picking waves).';

-- 4. Tabela de Junção (Wave <-> Shipment)
CREATE TABLE public.picking_wave_shipments (
    wave_id uuid NOT NULL REFERENCES public.picking_waves(id) ON DELETE CASCADE,
    shipment_id uuid NOT NULL REFERENCES public.logistics_shipments(id) ON DELETE CASCADE,
    PRIMARY KEY (wave_id, shipment_id)
);

-- 5. Tabela de Tarefas de Picking (Tarefas)
CREATE TABLE public.picking_tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    wave_id uuid NOT NULL REFERENCES public.picking_waves(id) ON DELETE CASCADE,
    variante_id uuid NOT NULL REFERENCES public.variante(id) ON DELETE RESTRICT,
    quantity_required INT NOT NULL,
    quantity_picked INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.picking_tasks IS 'Lista agregada de itens a separar do estoque.';


-- 6. Função Trigger: Cria Envio ao Concluir Produção
CREATE OR REPLACE FUNCTION public.create_shipment_on_production_completion()
RETURNS TRIGGER AS $$
DECLARE
    initial_status_id uuid;
BEGIN
    -- Gatilho deve ser acionado na tabela production_orders (P3)
    IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
        
        -- Busca o ID do status inicial de logística ('Aguardando Picking' ou equivalente)
        SELECT id INTO initial_status_id FROM public.logistics_shipment_statuses 
        WHERE is_initial_status = TRUE LIMIT 1;

        -- Cria o registro de envio
        IF initial_status_id IS NOT NULL THEN
            INSERT INTO public.logistics_shipments (order_id, status_id)
            VALUES (NEW.order_id, initial_status_id)
            ON CONFLICT (order_id) DO NOTHING;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Criação do Trigger (NOTA: O trigger será criado na tabela production_orders na migração 008, após esta)

-- 8. Habilitação de RLS (Item 7)
ALTER TABLE public.logistics_shipment_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.picking_waves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.picking_wave_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.picking_tasks ENABLE ROW LEVEL SECURITY;

-- 9. Políticas de RLS (Item 7)
-- AdminGeral, Administrativo: Acesso Total
CREATE POLICY "RLS: Admins - Total Access (Logistics Statuses)" ON public.logistics_shipment_statuses FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo') );
CREATE POLICY "RLS: Admins - Total Access (Shipments)" ON public.logistics_shipments FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo') );
CREATE POLICY "RLS: Admins - Total Access (Picking Waves)" ON public.picking_waves FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo') );
CREATE POLICY "RLS: Admins - Total Access (Picking Tasks)" ON public.picking_tasks FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo') );

-- Producao (Inclui Logística): Acesso Total/Write (para gerenciar o picking/packing)
CREATE POLICY "RLS: Producao - Total Access (Picking Waves)" ON public.picking_waves FOR ALL USING ( (auth.jwt() ->> 'role') = 'Producao' );
CREATE POLICY "RLS: Producao - Total Access (Shipments)" ON public.logistics_shipments FOR ALL USING ( (auth.jwt() ->> 'role') = 'Producao' );
CREATE POLICY "RLS: Producao - Total Access (Picking Tasks)" ON public.picking_tasks FOR ALL USING ( (auth.jwt() ->> 'role') = 'Producao' );

-- Vendas/Outros: Leitura
CREATE POLICY "RLS: Vendas - Read Access (Shipments/Statuses)" ON public.logistics_shipments FOR SELECT USING ( (auth.jwt() ->> 'role') IN ('Vendas', 'Conteudo') );


COMMIT;
