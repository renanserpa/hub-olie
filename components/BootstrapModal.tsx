import React from 'react';
import Modal from './ui/Modal';
import { Button } from './ui/Button';
import { Copy, AlertTriangle } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const bootstrapSqlScript = `-- Script de Bootstrap Idempotente para Usuários
-- Este script pode ser executado várias vezes sem causar erros.

-- 1. Cria a tabela de perfis se ela não existir.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Cria a tabela de permissões se ela não existir.
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilita Row Level Security (RLS).
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Remove políticas antigas para garantir uma criação limpa.
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual user to read their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Allow admins to manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admins to manage roles" ON public.user_roles;

-- 5. Cria as políticas de acesso.
CREATE POLICY "Allow authenticated users to read profiles"
ON public.profiles FOR SELECT
USING ( auth.role() = 'authenticated' );

CREATE POLICY "Allow individual user to read their own role"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Cria uma função helper para checar a permissão de admin.
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.user_roles WHERE user_id = p_user_id;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cria as políticas de admin.
CREATE POLICY "Allow admins to manage profiles"
ON public.profiles FOR ALL
USING ( get_user_role(auth.uid()) = 'AdminGeral' );

CREATE POLICY "Allow admins to manage roles"
ON public.user_roles FOR ALL
USING ( get_user_role(auth.uid()) = 'AdminGeral' );

-- 6. INSERÇÃO DO PRIMEIRO ADMINISTRADOR --
-- ATENÇÃO: Substitua 'SEU_USER_ID_AQUI' abaixo pelo User ID copiado do painel de Autenticação.
INSERT INTO public.profiles (id, email, role)
VALUES ('SEU_USER_ID_AQUI', 'serparenan@gmail.com', 'AdminGeral')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('SEU_USER_ID_AQUI', 'AdminGeral')
ON CONFLICT (user_id) DO NOTHING;
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
                <h4 className="font-semibold">Ação Necessária</h4>
                <p>Detectamos que as tabelas de usuários e permissões não existem ou estão inacessíveis. Siga os passos abaixo para finalizar a configuração.</p>
            </div>
        </div>
        
        <div className="space-y-2">
            <p><strong>Passo 1:</strong> No seu painel do Supabase, vá para a seção "Authentication" e copie o "User ID" do seu usuário <strong>serparenan@gmail.com</strong>.</p>
            <p><strong>Passo 2:</strong> Vá para a seção "SQL Editor", clique em "+ New query", cole o script abaixo, **substitua o texto 'SEU_USER_ID_AQUI'** pelo ID que você copiou e clique em "RUN".</p>
        </div>

        <div className="relative bg-secondary dark:bg-dark-secondary p-4 rounded-lg max-h-60 overflow-y-auto">
            <Button size="sm" onClick={handleCopy} className="absolute top-2 right-2">
                <Copy className="w-4 h-4 mr-2" /> Copiar Script
            </Button>
            <pre className="text-xs whitespace-pre-wrap font-mono">{bootstrapSqlScript}</pre>
        </div>

        <p>Após executar o script, feche este aviso e tente fazer o login novamente.</p>

        <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>Entendi, vou executar o script</Button>
        </div>
      </div>
    </Modal>
  );
};

export default BootstrapModal;