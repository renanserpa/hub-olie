
import React, { useState } from 'react';
import Modal from './ui/Modal';
import { Button } from './ui/Button';
import { Copy, AlertTriangle, Database, CheckCircle } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { cn } from '../lib/utils';

export const bootstrapSqlScript = `-- 🧠 Olie Hub — Bootstrap Mestre (v8.5 - Completo & Corrigido)
-- COPIE E EXECUTE NO SQL EDITOR DO SUPABASE

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CORREÇÃO DE ACESSO E RLS (CRÍTICO)
DO $$
DECLARE
  tbl_name TEXT;
BEGIN
  FOR tbl_name IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(tbl_name) || ' ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS "Acesso Total" ON public.' || quote_ident(tbl_name) || ';';
    EXECUTE 'DROP POLICY IF EXISTS "Permissive Access" ON public.' || quote_ident(tbl_name) || ';';
    EXECUTE 'CREATE POLICY "Acesso Total" ON public.' || quote_ident(tbl_name) || ' FOR ALL USING (true) WITH CHECK (true);';
  END LOOP;
END $$;

-- 3. TABELAS CORE (Login & Perfil)
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Vendas',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);
-- Garante coluna last_login se tabela já existia
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RECUPERAÇÃO DO USUÁRIO MASTER
DO $$
BEGIN
    UPDATE auth.users 
    SET encrypted_password = crypt('111111', gen_salt('bf')) 
    WHERE email = 'adm@adm.com';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Senha não alterada (permissão insuficiente). Use o painel Auth se necessário.';
END $$;

INSERT INTO public.profiles (id, email, role, created_at, last_login)
SELECT id, email, 'AdminGeral', NOW(), NOW() FROM auth.users WHERE email = 'adm@adm.com'
ON CONFLICT (id) DO UPDATE SET role = 'AdminGeral';

-- 5. MÓDULO SISTEMA & CONFIGURAÇÕES
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

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MÓDULO PRODUTOS (CATÁLOGO)
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
    created_by UUID,
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

-- 7. MÓDULO ESTOQUE & COMPRAS
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
    type TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    reason TEXT,
    ref TEXT,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- 8. MÓDULO PEDIDOS (VENDAS)
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

-- 9. MÓDULO PRODUÇÃO
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
    result TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MÓDULO FINANCEIRO
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
    type TEXT,
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

-- 11. MÓDULO LOGÍSTICA
CREATE TABLE IF NOT EXISTS public.logistics_waves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wave_number TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    order_ids TEXT[],
    created_by UUID,
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

-- 12. MÓDULO MARKETING
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

-- 13. ANALYTICS & EXECUTIVE
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
    type TEXT,
    insight TEXT,
    period TEXT,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. OMNICHANNEL
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

-- 15. TABELAS AUXILIARES & CATÁLOGOS
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

-- Catálogos Específicos
CREATE TABLE IF NOT EXISTS public.config_color_palettes ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, descricao TEXT, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW() );
CREATE TABLE IF NOT EXISTS public.fabric_colors ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, hex TEXT, palette_id UUID REFERENCES public.config_color_palettes(id), is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW() );
CREATE TABLE IF NOT EXISTS public.zipper_colors ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, hex TEXT, palette_id UUID REFERENCES public.config_color_palettes(id), is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW() );
CREATE TABLE IF NOT EXISTS public.bias_colors ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, hex TEXT, palette_id UUID REFERENCES public.config_color_palettes(id), is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW() );
CREATE TABLE IF NOT EXISTS public.lining_colors ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, hex TEXT, palette_id UUID REFERENCES public.config_color_palettes(id), is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW() );
CREATE TABLE IF NOT EXISTS public.puller_colors ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, hex TEXT, palette_id UUID REFERENCES public.config_color_palettes(id), is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW() );
CREATE TABLE IF NOT EXISTS public.embroidery_colors ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, hex TEXT, thread_type TEXT, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW() );
CREATE TABLE IF NOT EXISTS public.fabric_textures ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, description TEXT, image_url TEXT, hex_code TEXT, fabric_color_id UUID, supplier_sku TEXT, manufacturer_sku TEXT, manufacturer_id UUID, distributor_id UUID, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW() );
CREATE TABLE IF NOT EXISTS public.config_fonts ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, style TEXT, category TEXT, preview_url TEXT, font_file_url TEXT, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW() );
CREATE TABLE IF NOT EXISTS public.analytics_login_events ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_name TEXT, method TEXT, user_id UUID, metadata JSONB, created_at TIMESTAMPTZ DEFAULT NOW() );

-- Seed Inicial
INSERT INTO public.warehouses (name, location) VALUES ('Depósito Principal', 'Matriz') ON CONFLICT DO NOTHING;
`;

interface BootstrapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ModalTab = 'bootstrap';

const BootstrapModal: React.FC<BootstrapModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<ModalTab>('bootstrap');

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copiado!", description: "Script SQL copiado." });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Configuração do Banco de Dados">
            <div className="space-y-4">
                <div className="flex gap-2 border-b border-border pb-2 mb-2">
                    <button 
                        onClick={() => setActiveTab('bootstrap')}
                        className={cn("px-4 py-2 text-sm font-medium rounded-md transition-colors", activeTab === 'bootstrap' ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-secondary')}
                    >
                        Script de Correção (Usuário Master)
                    </button>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 text-amber-800 flex items-start gap-3">
                    <Database className="h-5 w-5 mt-0.5" />
                    <div>
                        <p className="font-bold">Recuperação de Acesso</p>
                        <p className="text-sm mt-1">
                            Use este script para garantir que o usuário <strong>adm@adm.com</strong> tenha permissões de administrador e que todas as tabelas estejam criadas corretamente.
                        </p>
                    </div>
                </div>
                
                <div className="relative">
                    <pre className="bg-secondary dark:bg-dark-secondary p-4 rounded-lg text-xs overflow-auto max-h-64 border border-border font-mono">
                        {bootstrapSqlScript}
                    </pre>
                    <Button size="sm" className="absolute top-2 right-2" onClick={() => handleCopy(bootstrapSqlScript)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar SQL
                    </Button>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={onClose}>Fechar</Button>
                </div>
            </div>
        </Modal>
    );
};

export default BootstrapModal;
