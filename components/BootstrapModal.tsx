import React from 'react';
import Modal from './ui/Modal';
import { Button } from './ui/Button';
import { Copy, AlertTriangle } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const bootstrapSqlScript = `-- Script de Bootstrap Automático para Usuários v2.0
-- Este script pode ser executado várias vezes sem causar erros.

-- 1. Cria as tabelas de controle de acesso se não existirem.
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

-- 2. Habilita Row Level Security (RLS) para segurança.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Limpa políticas antigas para garantir uma aplicação limpa.
DROP POLICY IF EXISTS "Permite leitura de perfis" ON public.profiles;
DROP POLICY IF EXISTS "Permite leitura da própria função" ON public.user_roles;
DROP POLICY IF EXISTS "Admins gerenciam perfis" ON public.profiles;
DROP POLICY IF EXISTS "Admins gerenciam funções" ON public.user_roles;

-- 4. Cria as políticas de acesso essenciais.
CREATE POLICY "Permite leitura de perfis"
ON public.profiles FOR SELECT
USING ( auth.role() = 'authenticated' );

CREATE POLICY "Permite leitura da própria função"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Cria uma função helper para verificar o papel de Admin de forma segura.
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.user_roles WHERE user_id = p_user_id;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admins gerenciam perfis"
ON public.profiles FOR ALL
USING ( get_user_role(auth.uid()) = 'AdminGeral' );

CREATE POLICY "Admins gerenciam funções"
ON public.user_roles FOR ALL
USING ( get_user_role(auth.uid()) = 'AdminGeral' );


-- 5. INSERÇÃO AUTOMÁTICA DO ADMINISTRADOR
-- Este bloco encontra o ID do usuário pelo email e o configura como AdminGeral.
-- Não é necessário editar este script.
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Encontra o ID do usuário administrador na tabela de autenticação.
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'serparenan@gmail.com' LIMIT 1;

  -- Se o usuário existir, insere/atualiza suas permissões.
  IF admin_user_id IS NOT NULL THEN
    -- Garante que o perfil existe.
    INSERT INTO public.profiles (id, email, role)
    VALUES (admin_user_id, 'serparenan@gmail.com', 'AdminGeral')
    ON CONFLICT (id) DO UPDATE SET role = 'AdminGeral';

    -- Garante que a permissão existe (essencial para o login).
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'AdminGeral')
    ON CONFLICT (user_id) DO UPDATE SET role = 'AdminGeral';

    RAISE NOTICE 'Usuário administrador "serparenan@gmail.com" configurado com sucesso.';
  ELSE
    RAISE WARNING 'AVISO: O usuário "serparenan@gmail.com" não foi encontrado na tabela auth.users. Por favor, crie este usuário no painel de Autenticação do Supabase e execute este script novamente.';
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
                <h4 className="font-semibold">Ação Necessária</h4>
                <p>Detectamos que as tabelas de permissões do seu banco de dados não estão configuradas. Para resolver, siga os passos abaixo.</p>
            </div>
        </div>
        
        <div className="space-y-2">
            <p><strong>Passo 1:</strong> Confirme que você criou o usuário <strong>serparenan@gmail.com</strong> no painel de "Authentication" do seu projeto Supabase.</p>
            <p><strong>Passo 2:</strong> Vá para a seção "SQL Editor", clique em "+ New query", copie e cole o script abaixo e clique em "RUN". **Não é necessário editar o script.**</p>
        </div>

        <div className="relative bg-secondary dark:bg-dark-secondary p-4 rounded-lg max-h-60 overflow-y-auto">
            <Button size="sm" onClick={handleCopy} className="absolute top-2 right-2">
                <Copy className="w-4 h-4 mr-2" /> Copiar Script
            </Button>
            <pre className="text-xs whitespace-pre-wrap font-mono">{bootstrapSqlScript}</pre>
        </div>

        <p>Após executar o script com sucesso, feche este aviso e tente fazer o login novamente.</p>

        <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>Entendi, vou executar o script</Button>
        </div>
      </div>
    </Modal>
  );
};

export default BootstrapModal;