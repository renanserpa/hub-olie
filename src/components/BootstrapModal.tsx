
import React, { useState } from 'react';
import Modal from './ui/Modal';
import { Button } from './ui/Button';
import { Copy, AlertTriangle, Database, CheckCircle } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { cn } from '../lib/utils';

export const bootstrapSqlScript = `-- 🧠 Olie Hub — Bootstrap Mestre (v8.3 - Correção e Desbloqueio Total)
-- COPIE E EXECUTE NO SQL EDITOR DO SUPABASE

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. LIMPEZA DE POLÍTICAS ANTIGAS (Para destravar acesso)
DO $$
DECLARE
  tbl_name TEXT;
BEGIN
  FOR tbl_name IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(tbl_name) || ' ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS "Acesso Total" ON public.' || quote_ident(tbl_name) || ';';
    EXECUTE 'DROP POLICY IF EXISTS "Permissive Access" ON public.' || quote_ident(tbl_name) || ';';
    -- Cria política PERMISSIVA para destravar o acesso imediatamente
    EXECUTE 'CREATE POLICY "Acesso Total" ON public.' || quote_ident(tbl_name) || ' FOR ALL USING (true) WITH CHECK (true);';
  END LOOP;
END $$;

-- 3. CORREÇÃO DA TABELA DE PERFIS (CRÍTICO PARA LOGIN)
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Vendas',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garante que a coluna last_login exista
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RECUPERAÇÃO DO ADMIN (adm@adm.com)
INSERT INTO public.profiles (id, email, role, created_at, last_login)
SELECT 
    id, 
    email, 
    'AdminGeral', 
    NOW(), 
    NOW()
FROM auth.users 
WHERE email = 'adm@adm.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'AdminGeral';

-- 5. TABELAS DE NEGÓCIO (Criação se não existirem)

-- Configurações
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

-- Produtos
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

-- Estoque
CREATE TABLE IF NOT EXISTS public.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.config_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sku TEXT,
    group_id UUID, -- FK pode ser adicionada depois
    supplier_id UUID,
    unit TEXT DEFAULT 'un',
    default_cost NUMERIC DEFAULT 0,
    low_stock_threshold NUMERIC DEFAULT 10,
    url_public TEXT,
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
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pedidos
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

-- Produção
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

-- Seed Básico
INSERT INTO public.warehouses (name, location) VALUES ('Depósito Principal', 'Matriz') ON CONFLICT DO NOTHING;

-- FIM DO SCRIPT
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
        <Modal isOpen={isOpen} onClose={onClose} title="Correção do Banco de Dados">
            <div className="space-y-4">
                <div className="flex gap-2 border-b border-border pb-2 mb-2">
                    <button 
                        onClick={() => setActiveTab('bootstrap')}
                        className={cn("px-4 py-2 text-sm font-medium rounded-md transition-colors", activeTab === 'bootstrap' ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-secondary')}
                    >
                        1. Script de Correção (Executar no Supabase)
                    </button>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 text-amber-800 flex items-start gap-3">
                    <Database className="h-5 w-5 mt-0.5" />
                    <div>
                        <p className="font-bold">Atenção Necessária</p>
                        <p className="text-sm mt-1">
                            Parece que seu banco de dados está incompleto ou com permissões bloqueadas. 
                            Copie o script abaixo e execute no <strong>SQL Editor</strong> do Supabase para corrigir e criar as tabelas.
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
