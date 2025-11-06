-- Olie Hub - Migração 011: Seeding de Dados Iniciais
-- Contém os dados mestres e de exemplo para testes de homologação

BEGIN;

-- Variáveis de uso interno para referenciar FKs
-- NOTA: O Supabase CLI não suporta DECLARE/SET fora de FUNÇÕES/DO BLOCK. 
-- Em um ambiente real, você usaria 'psql' ou um bloco DO.
-- Aqui, usaremos IDs fixos para garantir que os testes de Homologação funcionem.
-- Substitua 'uuid_generate_v4()' por UUIDs fixos em ambiente de homologação.
-- Ex: 'a0000000-0000-0000-0000-000000000001'

-- =======================================================
-- 1. População de Status Masters (ENUMs)
-- =======================================================

INSERT INTO public.production_task_statuses (id, name, sequence, is_terminal_status) VALUES
('00100000-0000-0000-0000-000000000001', 'A Fazer', 10, FALSE),
('00100000-0000-0000-0000-000000000002', 'Em Corte', 20, FALSE),
('00100000-0000-0000-0000-000000000003', 'Em Costura', 30, FALSE),
('00100000-0000-0000-0000-000000000004', 'Concluído', 40, TRUE);

INSERT INTO public.logistics_shipment_statuses (id, name, sequence, is_initial_status) VALUES
('00200000-0000-0000-0000-000000000001', 'Aguardando Picking', 10, TRUE),
('00200000-0000-0000-0000-000000000002', 'Embalado', 20, FALSE),
('00200000-0000-0000-0000-000000000003', 'Pronto para Envio', 30, FALSE),
('00200000-0000-0000-0000-000000000004', 'Enviado', 40, FALSE);


-- =======================================================
-- 2. Catálogos Mestre (DNA OLIE - Insumos, Produtos, Regras)
-- =======================================================

-- 2.1 Insumos
INSERT INTO public.inventory_raw_materials (id, name, unit_of_measure, cost_per_unit) VALUES
('a1000000-0000-0000-0000-000000000001', 'Courvim Viena 0.9 mm - Preto', 'm', 25.50),
('a1000000-0000-0000-0000-000000000002', 'Forro Nylon 600D - Bege', 'm', 12.00),
('a1000000-0000-0000-0000-000000000003', 'Zíper Nylon Bitola 3 - Preto', 'm', 1.20),
('a1000000-0000-0000-0000-000000000004', 'Cursor Bitola 3 - Dourado', 'un', 0.80);

-- 2.2 Peças-Base (Produto)
INSERT INTO public.produto (id, slug, nome) VALUES
('b1000000-0000-0000-0000-000000000001', 'celine', 'Celine Necessaire'),
('b1000000-0000-0000-0000-000000000002', 'paris', 'Paris Bolsa Clássica');

-- 2.3 Variantes (SKUs)
INSERT INTO public.variante (id, produto_id, tamanho, sku, preco_base_centavos) VALUES
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'M', 'OLI-CELINE-M-PRE-NYL', 7500); -- R$ 75.00

-- 2.4 Regras de Personalização
INSERT INTO public.personalizacao (id, produto_id, metodo, limites, taxa_base_centavos) VALUES
('d1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'bordado', '{"max_chars": 3, "min_contrast": 4.5}', 1500); -- R$ 15.00

-- 2.5 Configurações
INSERT INTO public.finance_accounts (id, name, account_type) VALUES
('e1000000-0000-0000-0000-000000000001', 'Banco Principal', 'asset'),
('e1000000-0000-0000-0000-000000000002', 'Contas a Pagar', 'liability');

-- 2.6 Fornecedores
INSERT INTO public.suppliers (id, name) VALUES
('f1000000-0000-0000-0000-000000000001', 'Fornecedor de Tecidos Sintéticos');


-- =======================================================
-- 3. Dados de Exemplo (Para Teste de Fluxo)
-- =======================================================

-- 3.1 Cliente e Pedido
INSERT INTO public.customers (id, name, email) VALUES
('g1000000-0000-0000-0000-000000000001', 'Renata Souza', 'renata.souza@teste.com');

INSERT INTO public.orders (id, customer_id, total_amount, status) VALUES
('h1000000-0000-0000-0000-000000000001', 'g1000000-0000-0000-0000-000000000001', 90.00, 'pending_payment'); -- R$ 75.00 (base) + R$ 15.00 (personalização)

INSERT INTO public.order_items (id, order_id, variante_id, quantity, unit_price) VALUES
('i1000000-0000-0000-0000-000000000001', 'h1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 1, 75.00);

-- 3.2 Exemplo de Personalização Anexa (Item de Pedido)
INSERT INTO public.item_personalizacao (id, order_item_id, personalizacao_id, valor, detalhes) VALUES
('j1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'R.S.', '{"fonte": "Arial", "cor_linha": "Preto"}');


COMMIT;
