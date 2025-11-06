-- Olie Hub - Migração 008: Omnichannel Core System
-- Conforme "vNova Base 2025" (Caixa Única e Fluxo Cotação -> Pedido)

BEGIN;

-- 1. Tabela Mestre de Canais
CREATE TABLE public.omni_channels (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE public.omni_channels IS 'Canais de comunicação (WhatsApp, Instagram, etc).';

-- 2. Criação de ENUMs para Status
CREATE TYPE public.omni_conversation_status AS ENUM (
    'new',
    'open',
    'pending_customer',
    'resolved'
);
CREATE TYPE public.omni_message_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE public.omni_quote_status AS ENUM (
    'draft',
    'sent',
    'accepted',
    'rejected',
    'expired'
);

-- 3. Tabela de Conversas (Caixa de Entrada)
CREATE TABLE public.omni_conversations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    channel_id uuid NOT NULL REFERENCES public.omni_channels(id) ON DELETE RESTRICT,
    assigned_to_user_id uuid, -- auth.users (Para atribuição de agentes)
    status public.omni_conversation_status NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.omni_conversations IS 'Thread da conversa, ligado ao cliente.';

-- 4. Tabela de Mensagens (Log Imutável)
CREATE TABLE public.omni_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id uuid NOT NULL REFERENCES public.omni_conversations(id) ON DELETE CASCADE,
    direction public.omni_message_direction NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.omni_messages IS 'Log imutável de todas as mensagens.';

-- 5. Tabela de Orçamentos (Quotes)
CREATE TABLE public.omni_quotes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id uuid NOT NULL REFERENCES public.omni_conversations(id) ON DELETE RESTRICT,
    status public.omni_quote_status NOT NULL DEFAULT 'draft',
    total_amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.omni_quotes IS 'Orçamento formal gerado na conversa.';

-- 6. Tabela de Itens do Orçamento
CREATE TABLE public.omni_quote_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id uuid NOT NULL REFERENCES public.omni_quotes(id) ON DELETE CASCADE,
    variante_id uuid NOT NULL REFERENCES public.variante(id) ON DELETE RESTRICT,
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    -- Customização de Item de Pedido (DNA OLIE)
    customizations JSONB -- Armazena a personalização negociada no orçamento
);
COMMENT ON TABLE public.omni_quote_items IS 'Itens e customizações de um orçamento.';


-- 7. Função Trigger: Converte Orçamento Aceito em Pedido (Atendimento -> Venda)
CREATE OR REPLACE FUNCTION public.convert_quote_to_order()
RETURNS TRIGGER AS $$
DECLARE
    v_customer_id uuid;
    new_order_id uuid;
    quote_item_record RECORD;
BEGIN
    -- Só executa quando o status muda PARA 'accepted'
    IF NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted' THEN
        
        -- 1. Obter o cliente
        SELECT customer_id INTO v_customer_id
        FROM public.omni_conversations WHERE id = NEW.conversation_id;

        -- 2. Criar o registro em 'orders' (status inicial: pending_payment)
        INSERT INTO public.orders (customer_id, total_amount, status)
        VALUES (v_customer_id, NEW.total_amount, 'pending_payment')
        ON CONFLICT (customer_id) DO NOTHING -- Hipótese: evitar pedidos duplicados
        RETURNING id INTO new_order_id;

        -- 3. Copiar itens e personalizações
        FOR quote_item_record IN
            SELECT * FROM public.omni_quote_items WHERE quote_id = NEW.id
        LOOP
            -- Cria o item do pedido (Orders)
            INSERT INTO public.order_items (order_id, variante_id, quantity, unit_price)
            VALUES (new_order_id, quote_item_record.variante_id, quote_item_record.quantity, quote_item_record.unit_price)
            RETURNING id INTO quote_item_record.id;

            -- Cria o registro em item_personalizacao (P1)
            IF quote_item_record.customizations IS NOT NULL THEN
                -- NOTA: A personalizacao_id precisa ser resolvida por lógica de negócio real.
                -- Aqui, apenas transferimos o JSONB para o log.
                INSERT INTO public.item_personalizacao (order_item_id, personalizacao_id, valor, detalhes)
                VALUES (quote_item_record.id, '00000000-0000-0000-0000-000000000000'::uuid, -- Placeholder ID (PENDÊNCIA_DE_NEGÓCIO: obter ID da Regra)
                        quote_item_record.customizations->>'text', quote_item_record.customizations);
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- NOTA: O placeholder '00000000-0000-0000-0000-000000000000' para personalizacao_id é uma PENDÊNCIA_DE_NEGÓCIO.
-- Em produção, este ID viria da regra real (tabela personalizacao).

-- 8. Criação do Trigger
CREATE TRIGGER on_quote_accepted_create_order
AFTER UPDATE ON public.omni_quotes
FOR EACH ROW EXECUTE FUNCTION public.convert_quote_to_order();


-- 9. Habilitação de RLS (Item 7)
ALTER TABLE public.omni_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_quote_items ENABLE ROW LEVEL SECURITY;

-- 10. Políticas de RLS (Item 7)
-- AdminGeral, Administrativo: Acesso Total
CREATE POLICY "RLS: Admins - Total Access (Omni)" ON public.omni_channels FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo') );
CREATE POLICY "RLS: Admins - Total Access (Conversations)" ON public.omni_conversations FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo') );
CREATE POLICY "RLS: Admins - Total Access (Messages)" ON public.omni_messages FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo') );
CREATE POLICY "RLS: Admins - Total Access (Quotes)" ON public.omni_quotes FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo') );
CREATE POLICY "RLS: Admins - Total Access (Quote Items)" ON public.omni_quote_items FOR ALL USING ( (auth.jwt() ->> 'role') IN ('AdminGeral', 'Administrativo') );

-- Vendas/Conteudo: Acesso Restrito por Atribuição (Caixa Única)
-- PENDÊNCIA: Configurar o `auth.uid()` para os testes de homologação.
CREATE POLICY "RLS: Vendas - Read/Write (Conversations Assigned)" ON public.omni_conversations FOR ALL USING ( (auth.jwt() ->> 'role') IN ('Vendas', 'Conteudo') AND (assigned_to_user_id = auth.uid() OR assigned_to_user_id IS NULL) );
CREATE POLICY "RLS: Vendas - Read/Write (Messages In Assigned)" ON public.omni_messages FOR ALL USING ( EXISTS (SELECT 1 FROM public.omni_conversations c WHERE c.id = conversation_id AND (c.assigned_to_user_id = auth.uid() OR c.assigned_to_user_id IS NULL)) );
CREATE POLICY "RLS: Vendas - Read/Write (Quotes In Assigned)" ON public.omni_quotes FOR ALL USING ( EXISTS (SELECT 1 FROM public.omni_conversations c WHERE c.id = conversation_id AND (c.assigned_to_user_id = auth.uid() OR c.assigned_to_user_id IS NULL)) );


COMMIT;
