import React, { useState } from 'react';
import Modal from './ui/Modal';
import { Button } from './ui/Button';
import { Copy, AlertTriangle, Database, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { cn } from '../lib/utils';

export const bootstrapSqlScript = `-- 🧠 Olie Hub — Bootstrap Mestre (v8.0 - Auditoria Total)
-- Execute este script no SQL Editor do Supabase para criar TODAS as tabelas necessárias.

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CORE & ACESSO
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Vendas',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CONFIGURAÇÕES DO SISTEMA
CREATE TABLE IF NOT EXISTS public.system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    olie_hub_name TEXT DEFAULT 'Olie Hub',
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    default_currency TEXT DEFAULT 'BRL',
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    category TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT,
    status TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MÓDULO: PRODUTOS
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Rascunho',
    base_sku TEXT,
    base_price NUMERIC DEFAULT 0,
    category TEXT,
    collection_ids TEXT[],
    images TEXT[],
    attributes JSONB DEFAULT '{}',
    available_sizes JSONB DEFAULT '[]',
    configurable_parts JSONB DEFAULT '[]',
    combination_rules JSONB DEFAULT '[]',
    base_bom JSONB DEFAULT '[]',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_base_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    name TEXT,
    sales_price NUMERIC DEFAULT 0,
    final_price NUMERIC DEFAULT 0,
    unit_of_measure TEXT DEFAULT 'UN',
    stock_quantity INT DEFAULT 0,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MÓDULO: CONFIGURAÇÕES DE MATERIAIS
CREATE TABLE IF NOT EXISTS public.config_supply_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    document TEXT,
    email TEXT,
    phone TEXT,
    payment_terms TEXT,
    lead_time_days INT,
    rating NUMERIC,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.config_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sku TEXT,
    group_id UUID REFERENCES public.config_supply_groups(id),
    supplier_id UUID REFERENCES public.suppliers(id),
    unit TEXT DEFAULT 'un',
    default_cost NUMERIC DEFAULT 0,
    low_stock_threshold NUMERIC DEFAULT 10,
    url_public TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MÓDULO: ESTOQUE (LEDGER)
CREATE TABLE IF NOT EXISTS public.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID REFERENCES public.config_materials(id),
    product_variant_id UUID REFERENCES public.product_variants(id),
    warehouse_id UUID REFERENCES public.warehouses(id),
    current_stock NUMERIC DEFAULT 0,
    reserved_stock NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID REFERENCES public.config_materials(id),
    product_variant_id UUID REFERENCES public.product_variants(id),
    warehouse_id UUID REFERENCES public.warehouses(id),
    type TEXT NOT NULL, -- 'in', 'out', 'adjust', 'transfer'
    quantity NUMERIC NOT NULL,
    reason TEXT,
    ref TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MÓDULO: PEDIDOS (VENDAS)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    document TEXT,
    address JSONB,
    stage TEXT DEFAULT 'Lead',
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.customers(id),
    status TEXT DEFAULT 'pending_payment',
    subtotal NUMERIC DEFAULT 0,
    discounts NUMERIC DEFAULT 0,
    shipping_fee NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    origin TEXT DEFAULT 'Manual',
    notes TEXT,
    payments JSONB DEFAULT '{}',
    fiscal JSONB DEFAULT '{}',
    logistics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    variant_sku TEXT,
    product_name TEXT,
    quantity INT DEFAULT 1,
    unit_price NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    config_json JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MÓDULO: PRODUÇÃO
CREATE TABLE IF NOT EXISTS public.production_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto TEXT,
    tamanho TEXT,
    rota TEXT[],
    tempos_std_min JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mold_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT,
    produto TEXT,
    descricao TEXT,
    local_armazenamento TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.production_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number TEXT NOT NULL UNIQUE,
    product_id UUID REFERENCES public.products(id),
    variant_sku TEXT,
    quantity INT DEFAULT 1,
    status TEXT DEFAULT 'novo',
    priority TEXT DEFAULT 'normal',
    due_date TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.production_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_order_id UUID REFERENCES public.production_orders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'Pendente',
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.production_quality_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_order_id UUID REFERENCES public.production_orders(id) ON DELETE CASCADE,
    inspector TEXT,
    result TEXT, -- 'Aprovado', 'Reprovado'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. MÓDULO: COMPRAS
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number TEXT NOT NULL,
    supplier_id UUID REFERENCES public.suppliers(id),
    status TEXT DEFAULT 'draft',
    total NUMERIC DEFAULT 0,
    issued_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    expected_delivery_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    material_id UUID REFERENCES public.config_materials(id),
    material_name TEXT,
    quantity NUMERIC DEFAULT 0,
    received_quantity NUMERIC DEFAULT 0,
    unit_price NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MÓDULO: FINANCEIRO
CREATE TABLE IF NOT EXISTS public.finance_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT DEFAULT 'checking',
    balance NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.finance_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT, -- 'income', 'expense'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.finance_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL,
    transaction_date DATE,
    status TEXT DEFAULT 'pending',
    account_id UUID REFERENCES public.finance_accounts(id),
    category_id UUID REFERENCES public.finance_categories(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.finance_payables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id TEXT,
    amount NUMERIC,
    due_date DATE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.finance_receivables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT,
    amount NUMERIC,
    due_date DATE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. MÓDULO: LOGÍSTICA
CREATE TABLE IF NOT EXISTS public.logistics_waves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wave_number TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    order_ids TEXT[],
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.logistics_shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id),
    order_number TEXT,
    customer_name TEXT,
    status TEXT DEFAULT 'pending',
    tracking_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.logistics_pick_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wave_id UUID REFERENCES public.logistics_waves(id) ON DELETE CASCADE,
    order_id UUID,
    product_name TEXT,
    variant_sku TEXT,
    quantity INT,
    picked_quantity INT DEFAULT 0,
    status TEXT DEFAULT 'pending',
    picked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. MÓDULO: MARKETING
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft',
    channels TEXT[],
    budget NUMERIC DEFAULT 0,
    spent NUMERIC DEFAULT 0,
    kpis JSONB DEFAULT '{}',
    segment_id UUID,
    template_id UUID,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.marketing_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    rules JSONB DEFAULT '[]',
    audience_size INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.marketing_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    channel TEXT,
    content_preview TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. MÓDULO: ANALYTICS & EXECUTIVE
CREATE TABLE IF NOT EXISTS public.analytics_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module TEXT,
    name TEXT,
    value NUMERIC,
    trend NUMERIC,
    unit TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_id UUID,
    value NUMERIC,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.executive_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module TEXT,
    name TEXT,
    value NUMERIC,
    trend NUMERIC,
    unit TEXT,
    period TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.executive_ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module TEXT,
    type TEXT, -- 'opportunity', 'positive', 'risk'
    insight TEXT,
    period TEXT,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. MÓDULO: OMNICHANNEL
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "customerId" UUID,
    "customerName" TEXT,
    "customerHandle" TEXT,
    channel TEXT,
    status TEXT,
    "assigneeId" UUID,
    priority TEXT,
    tags TEXT[],
    "unreadCount" INT DEFAULT 0,
    "lastMessageAt" TIMESTAMPTZ DEFAULT NOW(),
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "conversationId" UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    direction TEXT,
    content TEXT,
    "authorName" TEXT,
    status TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 15. TABELAS AUXILIARES (MEDIA, INITIALIZER, ETC)
CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drive_file_id TEXT,
    module TEXT,
    category TEXT,
    name TEXT,
    mime_type TEXT,
    size INT,
    url_public TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.initializer_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    role TEXT,
    category TEXT,
    status TEXT,
    last_heartbeat TIMESTAMPTZ,
    health_score NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.initializer_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT,
    module TEXT,
    action TEXT,
    status TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS public.workflow_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    description TEXT,
    trigger TEXT,
    action TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    type TEXT DEFAULT 'standard',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.governance_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT,
    suggested_value JSONB,
    explanation TEXT,
    confidence NUMERIC,
    status TEXT DEFAULT 'suggested',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_permissions (
    id TEXT PRIMARY KEY,
    role TEXT,
    scope TEXT,
    read BOOLEAN,
    write BOOLEAN,
    update BOOLEAN,
    delete BOOLEAN
);

CREATE TABLE IF NOT EXISTS public.system_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID,
    payload JSONB,
    status TEXT,
    retry_count INT DEFAULT 0,
    last_error TEXT,
    next_retry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID,
    event TEXT,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.config_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    description TEXT,
    api_key TEXT,
    endpoint_url TEXT,
    status TEXT DEFAULT 'disconnected',
    is_active BOOLEAN DEFAULT FALSE,
    last_sync TIMESTAMPTZ,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. TABELAS DE CATÁLOGO ESPECÍFICAS
CREATE TABLE IF NOT EXISTS public.config_color_palettes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    descricao TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fabric_colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    hex TEXT,
    palette_id UUID REFERENCES public.config_color_palettes(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.zipper_colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    hex TEXT,
    palette_id UUID REFERENCES public.config_color_palettes(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bias_colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    hex TEXT,
    palette_id UUID REFERENCES public.config_color_palettes(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lining_colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    hex TEXT,
    palette_id UUID REFERENCES public.config_color_palettes(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.puller_colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    hex TEXT,
    palette_id UUID REFERENCES public.config_color_palettes(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.embroidery_colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    hex TEXT,
    thread_type TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fabric_textures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    description TEXT,
    image_url TEXT,
    hex_code TEXT,
    fabric_color_id UUID,
    supplier_sku TEXT,
    manufacturer_sku TEXT,
    manufacturer_id UUID,
    distributor_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.config_fonts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    style TEXT,
    category TEXT,
    preview_url TEXT,
    font_file_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_login_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT,
    method TEXT,
    user_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 17. SEGURANÇA TOTAL (RLS PERMISSIVA PARA BOOTSTRAP)
DO $$
DECLARE
  tbl_name TEXT;
BEGIN
  FOR tbl_name IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(tbl_name) || ' ENABLE ROW LEVEL SECURITY;';
    -- Remove política antiga se existir
    EXECUTE 'DROP POLICY IF EXISTS "Acesso Total Autenticado" ON public.' || quote_ident(tbl_name) || ';';
    -- Cria política permissiva para usuários logados
    EXECUTE 'CREATE POLICY "Acesso Total Autenticado" ON public.' || quote_ident(tbl_name) || ' FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'');';
    -- Permite acesso anônimo apenas para leitura (opcional, útil para debug)
    EXECUTE 'DROP POLICY IF EXISTS "Leitura Anonima" ON public.' || quote_ident(tbl_name) || ';';
    EXECUTE 'CREATE POLICY "Leitura Anonima" ON public.' || quote_ident(tbl_name) || ' FOR SELECT USING (auth.role() = ''anon'');';
  END LOOP;
END $$;

-- 18. SEED INICIAL (Dados Mínimos)
INSERT INTO public.system_roles (name, description) VALUES 
('AdminGeral', 'Acesso total ao sistema'),
('Vendas', 'Acesso a pedidos e clientes'),
('Producao', 'Acesso à fila de produção'),
('Financeiro', 'Acesso a módulos financeiros'),
('Administrativo', 'Gerenciamento de configurações')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.warehouses (name, location) VALUES ('Depósito Principal', 'Matriz') ON CONFLICT DO NOTHING;

-- FIM DO SCRIPT
`;

export const validationSqlScript = `-- 🛠️ Olie Hub — Validação e Limpeza de Schema
-- Execute este script para identificar tabelas que faltam e tabelas "extras" que podem ser removidas.

DO $$
DECLARE
    -- Lista exata de tabelas esperadas pelo Frontend v8.0
    required_tables TEXT[] := ARRAY[
        'profiles', 'user_roles', 'system_config', 'system_settings', 'system_audit', 
        'system_permissions', 'system_roles', 'products', 'product_variants', 
        'product_categories', 'collections', 'config_supply_groups', 'suppliers', 
        'config_materials', 'warehouses', 'inventory_balances', 'inventory_movements', 
        'customers', 'orders', 'order_items', 'production_routes', 'mold_library', 
        'production_orders', 'production_tasks', 'production_quality_checks', 
        'purchase_orders', 'purchase_order_items', 'finance_accounts', 
        'finance_categories', 'finance_transactions', 'finance_payables', 
        'finance_receivables', 'logistics_waves', 'logistics_shipments', 
        'logistics_pick_tasks', 'marketing_campaigns', 'marketing_segments', 
        'marketing_templates', 'analytics_kpis', 'analytics_snapshots', 
        'executive_kpis', 'executive_ai_insights', 'conversations', 'messages', 
        'media_assets', 'initializer_agents', 'initializer_logs', 'workflow_rules', 
        'notifications', 'governance_suggestions', 'webhook_logs', 'integration_logs', 
        'config_integrations', 'config_color_palettes', 'fabric_colors', 
        'zipper_colors', 'bias_colors', 'lining_colors', 'puller_colors', 
        'embroidery_colors', 'fabric_textures', 'config_fonts', 'analytics_login_events'
    ];
    
    missing_tables TEXT[];
    extra_tables TEXT[];
    _tbl TEXT;
BEGIN
    -- 1. Verificar tabelas que faltam
    SELECT ARRAY_AGG(req_table) INTO missing_tables
    FROM unnest(required_tables) AS req_table
    WHERE req_table NOT IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public');

    -- 2. Verificar tabelas "extras" (que existem no banco mas não estão na lista)
    SELECT ARRAY_AGG(tablename) INTO extra_tables
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT IN (SELECT unnest(required_tables));

    -- 3. Imprimir Relatório
    RAISE NOTICE '---------------------------------------------------';
    RAISE NOTICE 'RELATÓRIO DE AUDITORIA DE SCHEMA (v8.0)';
    RAISE NOTICE '---------------------------------------------------';

    IF missing_tables IS NULL THEN
        RAISE NOTICE '✅ SUCESSO: Todas as tabelas necessárias estão presentes.';
    ELSE
        RAISE NOTICE '❌ ALERTA: As seguintes tabelas estão faltando:';
        FOREACH _tbl IN ARRAY missing_tables LOOP
            RAISE NOTICE '   - %', _tbl;
        END LOOP;
        RAISE NOTICE '   -> Execute o Script de Bootstrap completo para criá-las.';
    END IF;

    RAISE NOTICE '---------------------------------------------------';

    IF extra_tables IS NULL THEN
        RAISE NOTICE '✅ LIMPEZA: Nenhuma tabela obsoleta encontrada.';
    ELSE
        RAISE NOTICE '⚠️ ALERTA: Tabelas "Extras" encontradas (possível lixo de versões anteriores):';
        FOREACH _tbl IN ARRAY extra_tables LOOP
            RAISE NOTICE '   DROP TABLE IF EXISTS public.% CASCADE;', _tbl;
        END LOOP;
        RAISE NOTICE '   -> Copie os comandos acima para remover tabelas obsoletas (CUIDADO: Dados serão perdidos).';
    END IF;

    RAISE NOTICE '---------------------------------------------------';
END $$;
`;

interface BootstrapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ModalTab = 'bootstrap' | 'validation';

const BootstrapModal: React.FC<BootstrapModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<ModalTab>('bootstrap');

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copiado!", description: "Script SQL copiado." });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Gerenciamento de Banco de Dados">
            <div className="space-y-4">
                <div className="flex gap-2 border-b border-border pb-2 mb-2">
                    <button 
                        onClick={() => setActiveTab('bootstrap')}
                        className={cn("px-4 py-2 text-sm font-medium rounded-md transition-colors", activeTab === 'bootstrap' ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-secondary')}
                    >
                        1. Instalação (Bootstrap)
                    </button>
                    <button 
                        onClick={() => setActiveTab('validation')}
                        className={cn("px-4 py-2 text-sm font-medium rounded-md transition-colors", activeTab === 'validation' ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-secondary')}
                    >
                        2. Auditoria e Limpeza
                    </button>
                </div>

                {activeTab === 'bootstrap' ? (
                    <>
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 text-amber-800 flex items-start gap-3">
                            <Database className="h-5 w-5 mt-0.5" />
                            <div>
                                <p className="font-bold">Configuração Inicial / Recuperação</p>
                                <p className="text-sm mt-1">
                                    Use este script para criar todas as tabelas necessárias (v8.0) ou restaurar tabelas que faltam. É seguro rodar múltiplas vezes.
                                </p>
                            </div>
                        </div>
                        
                        <div className="relative">
                            <pre className="bg-secondary dark:bg-dark-secondary p-4 rounded-lg text-xs overflow-auto max-h-64 border border-border font-mono">
                                {bootstrapSqlScript}
                            </pre>
                            <Button size="sm" className="absolute top-2 right-2" onClick={() => handleCopy(bootstrapSqlScript)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar Bootstrap
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-800 flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 mt-0.5" />
                            <div>
                                <p className="font-bold">Validação de Schema</p>
                                <p className="text-sm mt-1">
                                    Este script compara seu banco atual com a versão v8.0 e gera comandos para remover tabelas velhas (limpeza). Verifique a aba "Messages" no SQL Editor do Supabase após executar.
                                </p>
                            </div>
                        </div>
                        
                        <div className="relative">
                            <pre className="bg-secondary dark:bg-dark-secondary p-4 rounded-lg text-xs overflow-auto max-h-64 border border-border font-mono">
                                {validationSqlScript}
                            </pre>
                            <Button size="sm" className="absolute top-2 right-2" onClick={() => handleCopy(validationSqlScript)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar Validação
                            </Button>
                        </div>
                    </>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={onClose}>Fechar</Button>
                </div>
            </div>
        </Modal>
    );
};

export default BootstrapModal;