import React from 'react';
import Modal from './ui/Modal';
import { Button } from './ui/Button';
import { Copy, AlertTriangle } from 'lucide-react';
import { toast } from '../hooks/use-toast';

export const bootstrapSqlScript = `-- 🧠 Olie Hub — Bootstrap Definitivo (v7.6 - Final)

-- 1. EXTENSÕES E CONFIGURAÇÕES INICIAIS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELAS DE ACESSO E PERFIL (CORE)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELAS DE PRODUTOS (CATÁLOGO)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Rascunho',
    base_sku TEXT NOT NULL, -- ESSENCIAL
    base_price NUMERIC NOT NULL DEFAULT 0, -- ESSENCIAL
    category TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    images TEXT[],
    attributes JSONB,
    available_sizes JSONB,
    configurable_parts JSONB,
    combination_rules JSONB,
    base_bom JSONB,
    collection_ids TEXT[]
);

CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_base_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT NOT NULL UNIQUE,
    name TEXT,
    sales_price NUMERIC DEFAULT 0,
    final_price NUMERIC DEFAULT 0,
    unit_of_measure TEXT DEFAULT 'UN',
    stock_quantity INT DEFAULT 0,
    configuration JSONB,
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

-- 4. CONFIGURAÇÕES E SISTEMA
CREATE TABLE IF NOT EXISTS public.system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    olie_hub_name TEXT NOT NULL DEFAULT 'Olie Hub Ops',
    timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    default_currency TEXT NOT NULL DEFAULT 'BRL',
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    category TEXT,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.system_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT,
    status TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. SEGURANÇA (RLS) - PERMISSIVA PARA INICIALIZAÇÃO
DO $$
DECLARE
  tbl_name TEXT;
BEGIN
  FOR tbl_name IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(tbl_name) || ' ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS "Acesso total autenticado" ON public.' || quote_ident(tbl_name) || ';';
    EXECUTE 'CREATE POLICY "Acesso total autenticado" ON public.' || quote_ident(tbl_name) || ' FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'');';
  END LOOP;
END $$;

-- 6. CONFIGURAR ADMIN (Insere se não existir)
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'AdminGeral' FROM auth.users WHERE email = 'adm@adm.com'
ON CONFLICT (id) DO UPDATE SET role = 'AdminGeral';
`;

interface BootstrapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const BootstrapModal: React.FC<BootstrapModalProps> = ({ isOpen, onClose }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(bootstrapSqlScript);
        toast({ title: "Copiado!", description: "Script SQL copiado para a área de transferência." });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Ação Necessária: Configurar Banco de Dados">
            <div className="space-y-4">
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 text-amber-800">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        <p className="font-bold">Banco de Dados Incompleto</p>
                    </div>
                    <p className="text-sm mt-1">
                        O sistema detectou que as tabelas necessárias não existem ou estão incompletas no seu projeto Supabase.
                    </p>
                </div>
                
                <p className="text-sm text-textSecondary">
                    Para corrigir, copie o código SQL abaixo e execute-o no <strong>SQL Editor</strong> do seu painel Supabase.
                </p>

                <div className="relative">
                    <pre className="bg-secondary dark:bg-dark-secondary p-4 rounded-lg text-xs overflow-auto max-h-64 border border-border">
                        {bootstrapSqlScript}
                    </pre>
                    <Button size="sm" className="absolute top-2 right-2" onClick={handleCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar SQL
                    </Button>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button onClick={onClose}>Fechar e Tentar Novamente</Button>
                </div>
            </div>
        </Modal>
    );
};

export default BootstrapModal;