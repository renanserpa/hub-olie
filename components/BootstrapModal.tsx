import React from 'react';
import Modal from './ui/Modal';
import { Button } from './ui/Button';
import { Copy, AlertTriangle } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const bootstrapSqlScript = `-- 🧠 Olie Hub — Bootstrap Definitivo (v4.1)
-- Adiciona tabelas de analytics e suas políticas de segurança.

-- 1. LIMPEZA (Opcional, mas recomendado para garantir um estado limpo)
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- 2. CRIAÇÃO DAS TABELAS DE CONTROLE DE ACESSO
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. HABILITAÇÃO E CRIAÇÃO DAS POLÍTICAS DE SEGURANÇA (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Permite que qualquer usuário autenticado veja a lista de perfis (necessário para dropdowns, etc.)
CREATE POLICY "Usuário autenticado pode listar perfis" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
-- Permite que um usuário leia apenas a sua própria função (role)
CREATE POLICY "Usuário lê sua própria função" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Permite que ADMINS (verificado via JWT) gerenciem perfis e funções. PREVINE RECURSÃO.
CREATE POLICY "AdminGeral gerencia perfis" ON public.profiles FOR ALL
USING ( (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role') = 'AdminGeral' );

CREATE POLICY "AdminGeral gerencia roles" ON public.user_roles FOR ALL
USING ( (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role') = 'AdminGeral' );

-- 4. INSERÇÃO DO ADMIN NAS TABELAS PÚBLICAS (após o passo manual)
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'serparenan@gmail.com' LIMIT 1;
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, role) VALUES (admin_user_id, 'serparenan@gmail.com', 'AdminGeral') ON CONFLICT (id) DO UPDATE SET role = 'AdminGeral';
    INSERT INTO public.user_roles (user_id, role) VALUES (admin_user_id, 'AdminGeral') ON CONFLICT (user_id) DO UPDATE SET role = 'AdminGeral';
    RAISE NOTICE 'Registros públicos para o AdminGeral criados/validados com sucesso.';
  END IF;
END $$;

-- 5. CRIAÇÃO DE TABELAS DE DADOS (PARA DASHBOARD)
CREATE TABLE IF NOT EXISTS public.analytics_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module TEXT NOT NULL,
    name TEXT NOT NULL,
    value TEXT NOT NULL,
    trend NUMERIC,
    unit TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.executive_ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module TEXT NOT NULL,
    type TEXT NOT NULL,
    insight TEXT NOT NULL,
    period TEXT,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. POLÍTICAS DE SEGURANÇA PARA AS NOVAS TABELAS
ALTER TABLE public.analytics_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para usuários autenticados (KPIs)"
ON public.analytics_kpis FOR SELECT
USING ( auth.role() = 'authenticated' );

CREATE POLICY "Permitir leitura para usuários autenticados (Insights)"
ON public.executive_ai_insights FOR SELECT
USING ( auth.role() = 'authenticated' );
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
                <p>Detectamos que seu banco de dados precisa ser configurado. Siga os passos abaixo com atenção.</p>
            </div>
        </div>
        
        <div className="space-y-3 p-4 border rounded-lg">
            <h5 className="font-bold text-lg">Passo 1: Configurar Permissão do Administrador (Manual)</h5>
            <p>Este é o passo mais importante para resolver o problema de acesso.</p>
            <ol className="list-decimal list-inside space-y-1 text-sm pl-2">
                <li>Vá para a seção **Authentication** no seu painel Supabase.</li>
                <li>Encontre o usuário `serparenan@gmail.com`, clique nos 3 pontos e em **"Edit user"**.</li>
                <li>Role até a seção **"User App Metadata"**.</li>
                <li>Cole o seguinte JSON e clique em **Save**:</li>
            </ol>
            <pre className="text-xs whitespace-pre-wrap font-mono bg-secondary p-2 rounded-md">{`{
  "role": "AdminGeral"
}`}</pre>
        </div>

        <div className="space-y-3 p-4 border rounded-lg">
             <h5 className="font-bold text-lg">Passo 2: Executar o Script de Inicialização</h5>
            <p>Após configurar o administrador, copie e execute o script abaixo no **SQL Editor** do Supabase para criar as tabelas de acesso.</p>
            <div className="relative bg-secondary dark:bg-dark-secondary p-4 rounded-lg max-h-40 overflow-y-auto">
                <Button size="sm" onClick={handleCopy} className="absolute top-2 right-2">
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