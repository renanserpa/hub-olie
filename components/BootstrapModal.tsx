import React from 'react';
import Modal from './ui/Modal';
import { Button } from './ui/Button';
import { Copy, AlertTriangle } from 'lucide-react';
import { toast } from '../hooks/use-toast';

// FIX: Export the bootstrapSqlScript constant to make it available for import.
export const bootstrapSqlScript = `-- 🧠 Olie Hub — Bootstrap Definitivo (v7.2)
-- Cria TODAS as tabelas, aplica RLS e políticas permissivas.
-- Este script é IDEMPOTENTE e seguro para ser executado múltiplas vezes.

-- 1️⃣ CONFIGURAÇÃO DE ACESSO (Profiles & Roles)
CREATE TABLE IF NOT EXISTS public.profiles (id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, email TEXT NOT NULL UNIQUE, role TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), last_login TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS public.user_roles (user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, role TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());

-- 2️⃣ CRIAÇÃO DE TODAS AS TABELAS DE NEGÓCIO
-- Módulo: Acesso e Segurança (RBAC)
CREATE TABLE IF NOT EXISTS public.system_roles (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT UNIQUE NOT NULL, description TEXT);
CREATE TABLE IF NOT EXISTS public.system_permissions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), role TEXT NOT NULL, scope TEXT NOT NULL, read BOOLEAN DEFAULT false, write BOOLEAN DEFAULT false, update BOOLEAN DEFAULT false, "delete" BOOLEAN DEFAULT false, UNIQUE(role, scope));

-- Módulo: Produtos
CREATE TABLE IF NOT EXISTS public.product_categories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, description TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.collections (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, description TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.products (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, description TEXT, base_sku TEXT NOT NULL, base_price NUMERIC NOT NULL, category TEXT, status TEXT NOT NULL, collection_ids UUID[], images TEXT[], created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), available_sizes JSONB, configurable_parts JSONB, combination_rules JSONB, base_bom JSONB, attributes JSONB, hasVariants BOOLEAN);
CREATE TABLE IF NOT EXISTS public.product_variants (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), product_base_id UUID REFERENCES public.products(id), sku TEXT NOT NULL UNIQUE, name TEXT, configuration JSONB, price_modifier NUMERIC, final_price NUMERIC, dimensions JSONB, bom JSONB, stock_quantity INT, created_at TIMESTAMPTZ DEFAULT now());

-- Módulo: Pedidos e Clientes
CREATE TABLE IF NOT EXISTS public.customers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, document TEXT, email TEXT, phone TEXT, whatsapp TEXT, instagram TEXT, address JSONB, birth_date DATE, phones JSONB, stage TEXT, tags TEXT[], created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.orders (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), number TEXT NOT NULL, customer_id UUID REFERENCES public.customers(id), status TEXT NOT NULL, subtotal NUMERIC, discounts NUMERIC, shipping_fee NUMERIC, total NUMERIC NOT NULL, notes TEXT, origin TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), payments JSONB, fiscal JSONB, logistics JSONB);
CREATE TABLE IF NOT EXISTS public.order_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID REFERENCES public.orders(id), product_id UUID, variant_sku TEXT, product_name TEXT, quantity INT NOT NULL, unit_price NUMERIC NOT NULL, total NUMERIC NOT NULL, config_json JSONB);
CREATE TABLE IF NOT EXISTS public.order_payments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID REFERENCES public.orders(id), date TIMESTAMPTZ, amount NUMERIC, method TEXT, status TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.order_timeline (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID REFERENCES public.orders(id), description TEXT, "user" TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.order_notes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID REFERENCES public.orders(id), note TEXT, "user" TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- Módulo: Estoque
CREATE TABLE IF NOT EXISTS public.warehouses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, location TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.inventory_balances (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), material_id UUID, product_variant_id UUID, warehouse_id UUID REFERENCES public.warehouses(id), current_stock NUMERIC NOT NULL DEFAULT 0, reserved_stock NUMERIC NOT NULL DEFAULT 0, location TEXT, updated_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.inventory_movements (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), material_id UUID, product_variant_id UUID, type TEXT NOT NULL, quantity NUMERIC NOT NULL, reason TEXT NOT NULL, ref TEXT, notes TEXT, warehouse_id UUID REFERENCES public.warehouses(id), created_at TIMESTAMPTZ DEFAULT now());

-- Módulo: Produção
CREATE TABLE IF NOT EXISTS public.production_orders (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), po_number TEXT NOT NULL, product_id UUID, variant_sku TEXT, product_name TEXT, quantity INT NOT NULL, status TEXT NOT NULL, priority TEXT NOT NULL, due_date DATE, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), completed_at TIMESTAMPTZ, operator TEXT, notes TEXT, order_code TEXT, assigned_to TEXT, start_date DATE, end_date DATE);
CREATE TABLE IF NOT EXISTS public.production_tasks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), production_order_id UUID REFERENCES public.production_orders(id), name TEXT NOT NULL, status TEXT NOT NULL, started_at TIMESTAMPTZ, finished_at TIMESTAMPTZ, notes TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.production_quality_checks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), production_order_id UUID REFERENCES public.production_orders(id), inspector TEXT NOT NULL, result TEXT NOT NULL, notes TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.task_statuses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, color TEXT, position INT);
CREATE TABLE IF NOT EXISTS public.tasks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT, status_id UUID REFERENCES public.task_statuses(id), client_name TEXT, quantity INT, position INT, priority TEXT);
CREATE TABLE IF NOT EXISTS public.production_audit (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), production_order_id UUID, event TEXT, details JSONB, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.production_routes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), produto TEXT, tamanho TEXT, rota TEXT[], tempos_std_min JSONB);
CREATE TABLE IF NOT EXISTS public.mold_library (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), codigo TEXT, produto TEXT, descricao TEXT, local_armazenamento TEXT);

-- Módulo: Compras
CREATE TABLE IF NOT EXISTS public.suppliers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, document TEXT, email TEXT, phone TEXT, payment_terms TEXT, lead_time_days INT, rating NUMERIC, is_active BOOLEAN DEFAULT true, notes TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.purchase_orders (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), po_number TEXT NOT NULL, supplier_id UUID REFERENCES public.suppliers(id), status TEXT NOT NULL, total NUMERIC NOT NULL, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), issued_at TIMESTAMPTZ, received_at TIMESTAMPTZ, expected_delivery_date DATE);
CREATE TABLE IF NOT EXISTS public.purchase_order_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), po_id UUID REFERENCES public.purchase_orders(id), material_id UUID, material_name TEXT, quantity NUMERIC NOT NULL, received_quantity NUMERIC DEFAULT 0, unit_price NUMERIC NOT NULL, total NUMERIC NOT NULL);

-- Módulo: Financeiro
CREATE TABLE IF NOT EXISTS public.finance_accounts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, type TEXT, balance NUMERIC);
CREATE TABLE IF NOT EXISTS public.finance_categories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, type TEXT, parent_category_id UUID);
CREATE TABLE IF NOT EXISTS public.finance_transactions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), description TEXT NOT NULL, amount NUMERIC NOT NULL, type TEXT NOT NULL, transaction_date DATE NOT NULL, status TEXT, account_id UUID REFERENCES public.finance_accounts(id), category_id UUID REFERENCES public.finance_categories(id), notes TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.finance_payables (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), purchase_order_id UUID, amount NUMERIC, due_date DATE, status TEXT);
CREATE TABLE IF NOT EXISTS public.finance_receivables (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID, amount NUMERIC, due_date DATE, status TEXT);

-- Módulos: Marketing, Logística, Omnichannel
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, description TEXT, status TEXT, channels TEXT[], budget NUMERIC, spent NUMERIC, kpis JSONB, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ, started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, scheduled_at TIMESTAMPTZ, segment_id UUID, template_id UUID);
CREATE TABLE IF NOT EXISTS public.marketing_segments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, description TEXT, rules JSONB, audience_size INT);
CREATE TABLE IF NOT EXISTS public.marketing_templates (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, channel TEXT, content_preview TEXT);
CREATE TABLE IF NOT EXISTS public.logistics_waves (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), wave_number TEXT NOT NULL, status TEXT, order_ids UUID[], created_by UUID, created_at TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS public.logistics_shipments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID, order_number TEXT, customer_name TEXT, status TEXT, tracking_code TEXT, created_at TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS public.logistics_pick_tasks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), wave_id UUID REFERENCES public.logistics_waves(id) ON DELETE CASCADE, order_id UUID REFERENCES public.orders(id), order_item_id UUID REFERENCES public.order_items(id), product_name TEXT, variant_sku TEXT, quantity INT NOT NULL, picked_quantity INT DEFAULT 0, status TEXT NOT NULL DEFAULT 'pending', picker_id UUID, picked_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.quotes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), status TEXT NOT NULL, items JSONB, totals JSONB, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.conversations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), "customerId" UUID REFERENCES public.customers(id), "customerName" TEXT, "customerHandle" TEXT, channel TEXT, status TEXT, "assigneeId" UUID, priority TEXT, tags TEXT[], "unreadCount" INT, "lastMessageAt" TIMESTAMPTZ, title TEXT, "quoteId" UUID REFERENCES public.quotes(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS public.messages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), "conversationId" UUID REFERENCES public.conversations(id) ON DELETE CASCADE, direction TEXT, content TEXT, "authorName" TEXT, "createdAt" TIMESTAMPTZ, status TEXT);

-- Módulos: Analytics e Executivo
CREATE TABLE IF NOT EXISTS public.analytics_kpis (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), module TEXT, name TEXT, value TEXT, trend NUMERIC, unit TEXT, description TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), kpi_id UUID, value NUMERIC, recorded_at TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS public.executive_kpis (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), module TEXT, name TEXT, value NUMERIC, trend NUMERIC, unit TEXT, period TEXT, description TEXT);
CREATE TABLE IF NOT EXISTS public.executive_ai_insights (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), module TEXT, type TEXT, insight TEXT, period TEXT, generated_at TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS public.analytics_login_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_name TEXT, method TEXT, user_id UUID, metadata JSONB, created_at TIMESTAMPTZ DEFAULT now());

-- Módulos: Configurações e Sistema
CREATE TABLE IF NOT EXISTS public.system_settings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), key TEXT NOT NULL UNIQUE, value TEXT, category TEXT, description TEXT);
CREATE TABLE IF NOT EXISTS public.system_audit (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), key TEXT, status TEXT, details JSONB, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.config_supply_groups (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, description TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.config_materials (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, sku TEXT, group_id UUID REFERENCES public.config_supply_groups(id), unit TEXT, is_active BOOLEAN, created_at TIMESTAMPTZ, url_public TEXT, drive_file_id TEXT, description TEXT, supplier_id UUID, default_cost NUMERIC, low_stock_threshold NUMERIC, care_instructions TEXT, technical_specs JSONB);
CREATE TABLE IF NOT EXISTS public.config_color_palettes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, descricao TEXT, is_active BOOLEAN);
CREATE TABLE IF NOT EXISTS public.fabric_colors (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, hex TEXT, palette_id UUID, is_active BOOLEAN);
CREATE TABLE IF NOT EXISTS public.zipper_colors (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, hex TEXT, palette_id UUID, is_active BOOLEAN);
CREATE TABLE IF NOT EXISTS public.bias_colors (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, hex TEXT, palette_id UUID, is_active BOOLEAN);
CREATE TABLE IF NOT EXISTS public.lining_colors (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, hex TEXT, palette_id UUID, is_active BOOLEAN);
CREATE TABLE IF NOT EXISTS public.puller_colors (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, hex TEXT, palette_id UUID, is_active BOOLEAN);
CREATE TABLE IF NOT EXISTS public.embroidery_colors (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, hex TEXT, thread_type TEXT, is_active BOOLEAN);
CREATE TABLE IF NOT EXISTS public.fabric_textures (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, description TEXT, image_url TEXT, hex_code TEXT, fabric_color_id UUID, supplier_sku TEXT, manufacturer_sku TEXT, manufacturer_id UUID, distributor_id UUID, is_active BOOLEAN);
CREATE TABLE IF NOT EXISTS public.config_fonts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, style TEXT, category TEXT, preview_url TEXT, font_file_url TEXT, is_active BOOLEAN);
CREATE TABLE IF NOT EXISTS public.media_assets (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), drive_file_id TEXT, module TEXT, category TEXT, name TEXT, mime_type TEXT, size BIGINT, url_public TEXT, created_at TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS public.config_integrations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, description TEXT, api_key TEXT, endpoint_url TEXT, status TEXT, is_active BOOLEAN, last_sync TIMESTAMPTZ, last_error TEXT);
CREATE TABLE IF NOT EXISTS public.integration_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), integration_id UUID, event TEXT, message TEXT, created_at TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS public.initializer_agents (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, role TEXT, category TEXT, status TEXT, last_heartbeat TIMESTAMPTZ, health_score NUMERIC);
CREATE TABLE IF NOT EXISTS public.initializer_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), agent_name TEXT, module TEXT, action TEXT, status TEXT, "timestamp" TIMESTAMPTZ, metadata JSONB);
CREATE TABLE IF NOT EXISTS public.initializer_sync_state (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), module TEXT, last_commit TEXT, last_diff TEXT, updated_at TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS public.workflow_rules (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, description TEXT, trigger TEXT, action TEXT, is_active BOOLEAN, type TEXT);
CREATE TABLE IF NOT EXISTS public.notifications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT, message TEXT, is_read BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.system_settings_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), key TEXT, old_value TEXT, new_value TEXT, source_module TEXT, confidence NUMERIC, explanation TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.system_settings_history (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), setting_id UUID, setting_key TEXT, old_value TEXT, new_value TEXT, changed_by TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.webhook_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), integration_id UUID, payload JSONB, status TEXT, retry_count INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.system_roles (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT UNIQUE NOT NULL, description TEXT);
CREATE TABLE IF NOT EXISTS public.system_permissions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), role TEXT NOT NULL, scope TEXT NOT NULL, read BOOLEAN DEFAULT false, write BOOLEAN DEFAULT false, update BOOLEAN DEFAULT false, "delete" BOOLEAN DEFAULT false, UNIQUE(role, scope));
CREATE TABLE IF NOT EXISTS public.governance_suggestions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), setting_key TEXT NOT NULL, suggested_value JSONB, explanation TEXT, confidence NUMERIC, status TEXT NOT NULL DEFAULT 'suggested', created_at TIMESTAMPTZ DEFAULT now());


-- 3️⃣ APLICAÇÃO DE POLÍTICAS RLS PERMISSIVAS PARA TODAS AS TABELAS
DO $$
DECLARE
  tbl_name TEXT;
BEGIN
  FOR tbl_name IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(tbl_name) || ' ENABLE ROW LEVEL SECURITY;';
    
    -- Limpa políticas antigas
    EXECUTE 'DROP POLICY IF EXISTS "Permitir acesso total para usuários autenticados" ON public.' || quote_ident(tbl_name) || ';';
    EXECUTE 'DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON public.' || quote_ident(tbl_name) || ';';
    EXECUTE 'DROP POLICY IF EXISTS "Permitir escrita para usuários autenticados" ON public.' || quote_ident(tbl_name) || ';';
    
    -- ATENÇÃO: Em um ambiente de produção real, as políticas deveriam ser mais restritivas e baseadas em papéis (roles).
    -- CUIDADO: Esta política é para DESENVOLVIMENTO. Em PRODUÇÃO, substitua por políticas RLS granulares e seguras.
    -- Esta política permissiva resolve os erros de 'violates row-level security policy' para o ambiente de desenvolvimento/homologação.
    EXECUTE 'CREATE POLICY "Permitir acesso total para usuários autenticados" ON public.' || quote_ident(tbl_name) || ' FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'');';

  END LOOP;
END $$;


-- 4️⃣ INSERÇÃO/VALIDAÇÃO FINAL DO ADMIN
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Este passo assume que o Passo Manual de criação do usuário admin já foi feito no painel do Supabase.
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'adm@adm.com' LIMIT 1;
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, role) VALUES (admin_user_id, 'adm@adm.com', 'AdminGeral') ON CONFLICT (id) DO UPDATE SET role = 'AdminGeral';
    INSERT INTO public.user_roles (user_id, role) VALUES (admin_user_id, 'AdminGeral') ON CONFLICT (user_id) DO UPDATE SET role = 'AdminGeral';
    RAISE NOTICE '✅ Bootstrap concluído! Registros públicos para o AdminGeral (adm@adm.com) criados/validados com sucesso.';
  ELSE
    RAISE WARNING '⚠️ Atenção: Usuário admin adm@adm.com não encontrado. Certifique-se de que o usuário foi criado na seção Authentication do Supabase com o metadata correto.';
  END IF;
END $$;
`;

interface BootstrapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BootstrapModal: React.FC<BootstrapModalProps> = ({ isOpen, onClose }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(bootstrapSqlScript);
    toast({ title: "Script Copiado!", description: "Cole o script no seu SQL Editor do Supabase." });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configuração Inicial do Banco de Dados" className="max-w-3xl">
      <div className="space-y-4">
        <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-200 text-sm flex items-start gap-3">
            <AlertTriangle className="w-8 h-8 mt-0.5 flex-shrink-0" />
            <div>
                <h4 className="font-semibold">Ação Necessária para Ativação</h4>
                <p>Detectamos que seu banco de dados está incompleto ou com permissões incorretas. Siga os passos abaixo para configurar a plataforma.</p>
            </div>
        </div>
        
        <div className="space-y-3 p-4 border rounded-lg">
            <h5 className="font-bold text-lg">Passo 1: Criar o Usuário Administrador (Manual e Obrigatório)</h5>
            <p className="text-sm">Este é o passo mais importante para resolver o problema de acesso.</p>
            <ol className="list-decimal list-inside space-y-1 text-sm pl-2">
                <li>Vá para a seção **Authentication** no seu painel Supabase.</li>
                <li>Clique em **"Add user"**.</li>
                <li>Preencha com o email <code className="bg-secondary p-1 rounded">adm@adm.com</code> e a senha <code className="bg-secondary p-1 rounded">123456</code> (ou outra de sua preferência, senhas muito curtas podem ser recusadas).</li>
                <li>**Importante:** Role até a seção **"User App Metadata"**.</li>
                <li>Cole o seguinte JSON e clique em **"Create user"**:</li>
            </ol>
            <pre className="text-xs whitespace-pre-wrap font-mono bg-secondary p-2 rounded-md">{`{
  "role": "AdminGeral"
}`}</pre>
        </div>

        <div className="space-y-3 p-4 border rounded-lg">
             <h5 className="font-bold text-lg">Passo 2: Executar o Script de Inicialização Completo</h5>
            <p className="text-sm">Após configurar o administrador, copie e execute o script abaixo no **SQL Editor** do Supabase para criar e configurar TODAS as tabelas e permissões.</p>
            <div className="relative bg-secondary dark:bg-dark-secondary p-4 rounded-lg max-h-40 overflow-y-auto">
                <Button size="sm" onClick={handleCopy} className="absolute top-2 right-2 z-10">
                    <Copy className="w-4 h-4 mr-2" /> Copiar Script
                </Button>
                <pre className="text-xs whitespace-pre-wrap font-mono">{bootstrapSqlScript}</pre>
            </div>
        </div>

        <p className="text-center font-semibold">Após seguir os dois passos, feche este aviso e tente fazer o login novamente.</p>

        <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>Entendi, vou executar os passos</Button>
        </div>
      </div>
    </Modal>
  );
};

export default BootstrapModal;