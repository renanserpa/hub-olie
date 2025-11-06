-- Olie Hub - Migração 010: Analytics and Executive Modules
-- Conforme "vNova Base 2025" (KPIs Pré-Agregados e Insights de IA)

BEGIN;

-- 1. Criação do ENUM para Módulos (para segmentação de acesso a KPIs)
CREATE TYPE public.analytics_module_owner AS ENUM (
    'Production',
    'Orders',
    'Finance',
    'Marketing',
    'Inventory',
    'Logistics'
);

-- 2. Tabela de Snapshots de KPIs (Rollups)
CREATE TABLE public.analytics_kpi_snapshots (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    kpi_name TEXT NOT NULL,
    module public.analytics_module_owner NOT NULL,
    value JSONB NOT NULL, -- Ex: { "value": 15000.00, "trend": 0.15 }
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE (snapshot_date, kpi_name)
);
COMMENT ON TABLE public.analytics_kpi_snapshots IS 'KPIs pré-agregados para dashboards rápidos (Analytics).';


-- 3. Tabela de Insights Executivos (IA)
CREATE TABLE public.executive_insights (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    module public.analytics_module_owner NOT NULL,
    insight_title TEXT NOT NULL,
    insight_summary TEXT NOT NULL, -- O texto gerado pelo Gemini
    source_kpi_names TEXT[], -- Array de KPIs que embasaram o insight
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.executive_insights IS 'Insights estratégicos gerados por IA para a Diretoria.';


-- 4. Habilitação de RLS (Item 7)
ALTER TABLE public.analytics_kpi_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_insights ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de RLS (Item 7)
-- RLS - Camada Analytics (Operacional/BI)
-- AdminGeral, Administrativo, Financeiro: Acesso Total
CREATE POLICY "RLS: Admins Finance - Total Access (KPI Snapshots)" ON public.analytics_kpi_snapshots FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo', 'Financeiro') );

-- Producao: Leitura restrita (Production, Inventory, Logistics)
CREATE POLICY "RLS: Producao - Read Access (Own KPIs)" ON public.analytics_kpi_snapshots FOR SELECT USING ( 
    (auth.jwt() ->> 'role') = 'Producao' AND 
    (module IN ('Production', 'Inventory', 'Logistics'))
);

-- Vendas/Conteudo: Leitura restrita (Orders, Marketing)
CREATE POLICY "RLS: Vendas - Read Access (Own KPIs)" ON public.analytics_kpi_snapshots FOR SELECT USING ( 
    (auth.jwt() ->> 'role') IN ('Vendas', 'Conteudo') AND 
    (module IN ('Orders', 'Marketing', 'Omnichannel'))
);


-- RLS - Camada Executive (Estratégica)
-- AdminGeral: Acesso Total
CREATE POLICY "RLS: AdminGeral - Total Access (Executive)" ON public.executive_insights FOR ALL USING ( (auth.jwt() ->> 'role') = 'AdminGeral' );

-- Administrativo, Financeiro: Leitura
CREATE POLICY "RLS: Admin Finance - Read Access (Executive)" ON public.executive_insights FOR SELECT USING ( (auth.jwt() ->> 'role') IN ('Administrativo', 'Financeiro') );

-- Vendas/Producao: Bloqueio Total (Ausência de política FOR SELECT)

COMMIT;
