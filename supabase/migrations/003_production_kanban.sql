-- Olie Hub - Migração 003: Production Kanban System
-- Conforme "vNova Base 2025" e "DNA OLIE" (Usa BOM/Moldes da 001)

BEGIN;

-- 1. Tabela Mestre de Status das Tarefas de Produção (Colunas do Kanban)
CREATE TABLE public.production_task_statuses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    sequence INT NOT NULL DEFAULT 0, -- Para ordenação
    is_terminal_status BOOLEAN NOT NULL DEFAULT FALSE, -- Flag para 'Concluído'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.production_task_statuses IS 'Define as colunas do Kanban de Produção.';

-- 2. Criação do ENUM para o status macro das Ordens de Produção
CREATE TYPE public.production_order_status AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'cancelled'
);

-- 3. Tabela de Ordens de Produção (Visão Macro)
-- NOTA: `order_id` será FOREIGN KEY na migração 004
CREATE TABLE public.production_orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid NOT NULL, -- FK futura para Orders (Migração 004)
    status public.production_order_status NOT NULL DEFAULT 'pending',
    -- Liga à Engenharia (DNA OLIE)
    bom_id uuid REFERENCES public.product_boms(id),
    mold_id uuid REFERENCES public.product_molds(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_production_orders_order_id ON public.production_orders(order_id);
COMMENT ON TABLE public.production_orders IS 'Macro view das Ordens de Produção (OPs).';

-- 4. Tabela de Tarefas de Produção (Visão Micro / Cards do Kanban)
CREATE TABLE public.production_tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    production_order_id uuid NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
    status_id uuid NOT NULL REFERENCES public.production_task_statuses(id) ON DELETE RESTRICT,
    assigned_to_user_id uuid, -- Referencia auth.users
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.production_tasks IS 'Tarefas individuais do Kanban (micro-gestão).';


-- 5. Função do Trigger: Atualiza o Status da Ordem de Produção (Automação)
CREATE OR REPLACE FUNCTION public.update_parent_production_order_status()
RETURNS TRIGGER AS $$
DECLARE
    total_tasks INT;
    completed_tasks INT;
BEGIN
    -- Só executa se o status da tarefa foi alterado
    IF NEW.status_id IS DISTINCT FROM OLD.status_id THEN
        -- Conta o total de tarefas e o total de tarefas concluídas para a OP pai
        SELECT COUNT(*), COUNT(*) FILTER (WHERE pts.is_terminal_status = TRUE)
        INTO total_tasks, completed_tasks
        FROM public.production_tasks pt
        JOIN public.production_task_statuses pts ON pt.status_id = pts.id
        WHERE pt.production_order_id = NEW.production_order_id;

        -- Se todas as tarefas estão concluídas, atualiza a OP pai para 'completed'
        IF total_tasks > 0 AND total_tasks = completed_tasks THEN
            UPDATE public.production_orders
            SET status = 'completed', updated_at = NOW()
            WHERE id = NEW.production_order_id;
        -- Caso contrário (se uma tarefa for reaberta), volta para 'in_progress'
        ELSIF total_tasks <> completed_tasks AND total_tasks > 0 THEN
             UPDATE public.production_orders
            SET status = 'in_progress', updated_at = NOW()
            WHERE id = NEW.production_order_id AND status <> 'in_progress';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Criação do Trigger
CREATE TRIGGER on_task_update_update_order_status
AFTER UPDATE ON public.production_tasks
FOR EACH ROW EXECUTE FUNCTION public.update_parent_production_order_status();


-- 7. Habilitação de RLS (Item 7)
ALTER TABLE public.production_task_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_tasks ENABLE ROW LEVEL SECURITY;

-- 8. Políticas de RLS (Item 7)
-- AdminGeral: Acesso Total
CREATE POLICY "RLS: AdminGeral - Acesso Total (task_statuses)" ON public.production_task_statuses FOR ALL USING ( (auth.jwt() ->> 'role') = 'AdminGeral' );
CREATE POLICY "RLS: AdminGeral - Acesso Total (orders)" ON public.production_orders FOR ALL USING ( (auth.jwt() ->> 'role') = 'AdminGeral' );
CREATE POLICY "RLS: AdminGeral - Acesso Total (tasks)" ON public.production_tasks FOR ALL USING ( (auth.jwt() ->> 'role') = 'AdminGeral' );

-- Producao: Leitura + UPDATE em tarefas (para mover no Kanban)
CREATE POLICY "RLS: Producao - Acesso Leitura (task_statuses)" ON public.production_task_statuses FOR SELECT USING ( (auth.jwt() ->> 'role') = 'Producao' );
CREATE POLICY "RLS: Producao - Acesso Leitura (orders)" ON public.production_orders FOR SELECT USING ( (auth.jwt() ->> 'role') = 'Producao' );
CREATE POLICY "RLS: Producao - Acesso Total (tasks)" ON public.production_tasks FOR ALL USING ( (auth.jwt() ->> 'role') = 'Producao' ); -- Permite que a produção crie/edite tarefas.

-- Vendas/Outros: Apenas Leitura
CREATE POLICY "RLS: Outros - Acesso Leitura (orders)" ON public.production_orders FOR SELECT USING ( (auth.jwt() ->> 'role') IN ('Vendas', 'Conteudo', 'Administrativo') );


COMMIT;
