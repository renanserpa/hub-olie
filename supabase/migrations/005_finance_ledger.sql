-- Olie Hub - Migração 005: Finance Ledger System
-- Conforme "vNova Base 2025" (Ledger de dupla entrada)

BEGIN;

-- 1. Criação de ENUMs para Tipos
CREATE TYPE public.finance_account_type AS ENUM (
    'asset',
    'liability',
    'revenue',
    'expense',
    'equity'
);
CREATE TYPE public.payable_receivable_status AS ENUM (
    'open',
    'partially_paid',
    'paid',
    'void'
);

-- 2. Tabela Mestre de Contas Financeiras
CREATE TABLE public.finance_accounts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    account_type public.finance_account_type NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.finance_accounts IS 'Plano de Contas para o ledger (Banco, Contas a Pagar, Receita).';

-- 3. Tabela de Transações Financeiras (Ledger Imutável de Dupla Entrada)
CREATE TABLE public.finance_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_group_id uuid NOT NULL, -- Agrupa as partidas (débito/crédito)
    account_id uuid NOT NULL REFERENCES public.finance_accounts(id),
    debit NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
    credit NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
    description TEXT,
    source_document_id uuid, -- ID do documento original (OP, Order, etc)
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT only_debit_or_credit CHECK (debit = 0 OR credit = 0)
);
COMMENT ON TABLE public.finance_transactions IS 'Ledger imutável de dupla entrada.';

-- 4. Tabela de Contas a Receber (AR)
CREATE TABLE public.finance_receivables (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL,
    due_date DATE,
    status public.payable_receivable_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_finance_receivables_order_id ON public.finance_receivables(order_id);
COMMENT ON TABLE public.finance_receivables IS 'Rastreamento de pagamentos devidos por clientes.';

-- 5. Função Trigger: Cria Conta a Receber quando o Pedido é Pago
CREATE OR REPLACE FUNCTION public.create_receivable_on_paid()
RETURNS TRIGGER AS $$
BEGIN
    -- Só executa quando o status muda PARA 'paid'
    IF NEW.status = 'paid' AND OLD.status IS DISTINCT FROM 'paid' THEN
        -- Cria a conta a receber
        INSERT INTO public.finance_receivables (order_id, amount, due_date, status)
        VALUES (NEW.id, NEW.total_amount, NEW.created_at::DATE, 'open')
        ON CONFLICT (order_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Criação do Trigger
CREATE TRIGGER on_order_paid_create_receivable
AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.create_receivable_on_paid();


-- 7. Habilitação de RLS (Item 7)
ALTER TABLE public.finance_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_receivables ENABLE ROW LEVEL SECURITY;

-- 8. Políticas de RLS (Item 7)
-- AdminGeral, Administrativo, Financeiro: Acesso Total
CREATE POLICY "RLS: Finance Admins - Acesso Total (Accounts)" ON public.finance_accounts FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo', 'Financeiro') );
CREATE POLICY "RLS: Finance Admins - Acesso Total (Transactions)" ON public.finance_transactions FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo', 'Financeiro') );
CREATE POLICY "RLS: Finance Admins - Acesso Total (Receivables)" ON public.finance_receivables FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo', 'Financeiro') );

-- Restante (Vendas, Producao): Sem Acesso (Bloqueio Total)
-- A ausência de políticas FOR SELECT para outros papéis bloqueia o acesso, cumprindo o requisito de segurança.


COMMIT;
