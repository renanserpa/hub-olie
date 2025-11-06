-- Olie Hub - Migração 009: Settings Core System
-- Conforme "vNova Base 2025" (Cérebro e Regras de Customização DNA OLIE)

BEGIN;

-- 1. Tabela de Parâmetros Globais do Sistema (Chave-Valor)
CREATE TABLE public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL, -- Ex: { "prazo_expedicao_dias": 2, "api_key_frete": "XYZ" }
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.system_settings IS 'Parâmetros globais de configuração do sistema.';

-- 2. Tabela de Agrupamentos de Insumos
CREATE TABLE public.config_supply_groups (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.config_supply_groups IS 'Agrupa insumos para organização e relatórios (ex: "Tecidos Externos").';

-- 3. Tabela de Regras de Customização (DNA OLIE)
CREATE TABLE public.config_customization_rules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customization_type TEXT NOT NULL, -- 'bordado', 'hot-stamping'
    name TEXT NOT NULL,
    base_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
    rules JSONB, -- { 'max_chars': 10, 'min_contrast': 4.5 }
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.config_customization_rules IS 'Define regras de negócio para personalização (custo, limites).';

-- 4. Tabela de Aplicação de Regras de Customização (Regra <-> Produto)
CREATE TABLE public.config_customization_rule_applicability (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    rule_id uuid NOT NULL REFERENCES public.config_customization_rules(id) ON DELETE CASCADE,
    produto_id uuid NOT NULL REFERENCES public.produto(id) ON DELETE CASCADE,
    UNIQUE (rule_id, produto_id)
);
COMMENT ON TABLE public.config_customization_rule_applicability IS 'Liga regras de customização a produtos específicos.';


-- 5. Habilitação de RLS (Item 7)
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_supply_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_customization_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_customization_rule_applicability ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de RLS (Item 7)
-- AdminGeral, Administrativo: Acesso Total
CREATE POLICY "RLS: Admins - Total Access (System Settings)" ON public.system_settings FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo') );
CREATE POLICY "RLS: Admins - Total Access (Supply Groups)" ON public.config_supply_groups FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo') );
CREATE POLICY "RLS: Admins - Total Access (Customization Rules)" ON public.config_customization_rules FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo') );
CREATE POLICY "RLS: Admins - Total Access (Rule Applicability)" ON public.config_customization_rule_applicability FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo') );

-- Outros (Vendas, Producao, Financeiro): Leitura
CREATE POLICY "RLS: Operational - Read Access (Settings)" ON public.system_settings FOR SELECT USING ( (auth.jwt() ->> 'role') IN ('Vendas', 'Conteudo', 'Producao', 'Financeiro') );
CREATE POLICY "RLS: Operational - Read Access (Groups/Rules)" ON public.config_customization_rules FOR SELECT USING ( (auth.jwt() ->> 'role') IN ('Vendas', 'Conteudo', 'Producao') );


COMMIT;
