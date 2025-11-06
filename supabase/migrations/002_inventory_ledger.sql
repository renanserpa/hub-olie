-- Olie Hub - Migração 002: Inventory Ledger System
-- Conforme "vNova Base 2025" e "DNA OLIE" (diferencia insumo/acabado)

BEGIN;

-- 1. Criação do ENUM para Tipos de Movimentação
CREATE TYPE public.inventory_movement_type AS ENUM (
    'purchase_in',      -- Entrada por compra (Inbound)
    'production_out',   -- Saída para consumo na produção
    'production_in',    -- Entrada de produto acabado (da produção)
    'sale_out',         -- Saída por venda
    'adjustment_in',
    'adjustment_out'
);

-- 2. Tabela de Movimentações de Estoque (o Log Imutável)
CREATE TABLE public.inventory_movements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Conforme DNA OLIE, o movimento afeta Insumo OU Variante (Produto Acabado)
    raw_material_id uuid REFERENCES public.inventory_raw_materials(id) ON DELETE RESTRICT,
    variante_id uuid REFERENCES public.variante(id) ON DELETE RESTRICT,
    movement_type public.inventory_movement_type NOT NULL,
    quantity INT NOT NULL,
    source_document_id uuid, -- ID do documento que originou (ex: PO, Order, OP)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraint: Garante que apenas um tipo de item seja afetado por movimento
    CONSTRAINT check_one_item_type CHECK (
        (raw_material_id IS NOT NULL AND variante_id IS NULL) OR
        (raw_material_id IS NULL AND variante_id IS NOT NULL)
    )
);
COMMENT ON TABLE public.inventory_movements IS 'Log imutável de todas as transações de estoque (Insumos e Acabados).';

-- 3. Tabela de Saldos de Estoque (o Estado Agregado)
CREATE TABLE public.inventory_balances (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    raw_material_id uuid REFERENCES public.inventory_raw_materials(id) ON DELETE CASCADE,
    variante_id uuid REFERENCES public.variante(id) ON DELETE CASCADE,
    quantity_on_hand INT NOT NULL DEFAULT 0,
    quantity_reserved INT NOT NULL DEFAULT 0, -- Para reservas de OP (Produção)
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraint: A chave de unicidade é a combinação (insumo OU variante)
    CONSTRAINT inventory_balances_unique_key UNIQUE (raw_material_id, variante_id),
    CONSTRAINT check_one_item_type_balance CHECK (
        (raw_material_id IS NOT NULL AND variante_id IS NULL) OR
        (raw_material_id IS NULL AND variante_id IS NOT NULL)
    )
);
COMMENT ON TABLE public.inventory_balances IS 'Saldo agregado de estoque (Insumos e Acabados) para consultas rápidas.';

-- 4. Função de Trigger para Manter Saldos (Atomicidade)
CREATE OR REPLACE FUNCTION public.update_inventory_balance_after_movement()
RETURNS TRIGGER AS $$
DECLARE
    target_raw_material_id uuid;
    target_variante_id uuid;
BEGIN
    target_raw_material_id := NEW.raw_material_id;
    target_variante_id := NEW.variante_id;

    -- Usa ON CONFLICT para garantir atomicidade no UPSERT
    INSERT INTO public.inventory_balances (raw_material_id, variante_id, quantity_on_hand, updated_at)
    VALUES (target_raw_material_id, target_variante_id, NEW.quantity, NOW())
    ON CONFLICT (raw_material_id, variante_id) DO UPDATE
    SET
        quantity_on_hand = public.inventory_balances.quantity_on_hand + NEW.quantity,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criação do Trigger
CREATE TRIGGER on_inventory_movement_insert
AFTER INSERT ON public.inventory_movements
FOR EACH ROW EXECUTE FUNCTION public.update_inventory_balance_after_movement();


-- 6. Habilitação de RLS (Item 7)
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_balances ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de RLS (Item 7)
-- AdminGeral, Administrativo (acesso total)
CREATE POLICY "RLS: Admins - Acesso Total (movements)" ON public.inventory_movements FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo') );
CREATE POLICY "RLS: Admins - Acesso Total (balances)" ON public.inventory_balances FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo') );

-- Producao: Leitura (SELECT) + update em reservations
CREATE POLICY "RLS: Producao - Acesso Leitura (balances)" ON public.inventory_balances FOR SELECT USING ( (auth.jwt() ->> 'role') = 'Producao' );
-- NOTA: O UPDATE em quantity_reserved será feito por funções seguras, não diretamente.

-- Financeiro: Leitura (SELECT)
CREATE POLICY "RLS: Financeiro - Acesso Leitura (balances)" ON public.inventory_balances FOR SELECT USING ( (auth.jwt() ->> 'role') = 'Financeiro' );


COMMIT;
