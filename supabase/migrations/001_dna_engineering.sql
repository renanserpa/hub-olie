-- Olie Hub - Migração 001: Engenharia de Produto (DNA OLIE)
-- spec_version: 6.3
-- Gerado por: AtlasAI Enterprise

BEGIN;

-- 1. Catálogos Mestre (Insumos)
CREATE TABLE public.inventory_raw_materials (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    unit_of_measure TEXT NOT NULL, -- ex: 'metros', 'unidades'
    cost_per_unit NUMERIC(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.inventory_raw_materials IS 'Catálogo mestre de insumos (DNA OLIE).';

-- 2. Engenharia de Produto (Peça-Base)
CREATE TABLE public.produto (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.produto IS 'A Peça-Base / Template (ex: Celine, Paris).';

-- 3. Variantes (SKUs)
CREATE TABLE public.variante (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id uuid NOT NULL REFERENCES public.produto(id) ON DELETE CASCADE,
  tamanho TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  peso_g INT,
  dimensoes JSONB, -- {L, A, P}
  preco_base_centavos INT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.variante IS 'O SKU único (Produto + Tamanho + Escolhas).';

-- 4. Atributos da Variante (As 5 Partes)
CREATE TABLE public.atributos_variante (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  variante_id uuid NOT NULL REFERENCES public.variante(id) ON DELETE CASCADE,
  -- 'parte' é alinhado com o DNA OLIE
  parte TEXT NOT NULL CHECK (parte IN ('tecido_externo', 'forro_interno', 'vies', 'ziper_cursor', 'puxador')),
  -- Referências aos catálogos de insumos
  raw_material_id uuid REFERENCES public.inventory_raw_materials(id),
  nome_valor TEXT -- ex: Cor 'Bege Olie', Bitola '5'
);
COMMENT ON TABLE public.atributos_variante IS 'Define as 5 partes (DNA OLIE) de uma Variante.';

-- 5. BOM (Lista de Materiais)
CREATE TABLE public.bom_componente (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  variante_id uuid NOT NULL REFERENCES public.variante(id) ON DELETE CASCADE,
  insumo_id uuid NOT NULL REFERENCES public.inventory_raw_materials(id),
  quantidade NUMERIC(10, 4) NOT NULL,
  unidade TEXT NOT NULL, -- 'm', 'un'
  perdas_pct NUMERIC(5, 2) DEFAULT 0
);
COMMENT ON TABLE public.bom_componente IS 'Bill of Materials (BOM) por Variante.';

-- 6. Personalização (Regras)
CREATE TABLE public.personalizacao (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id uuid NOT NULL REFERENCES public.produto(id),
  metodo TEXT NOT NULL, -- 'bordado', 'hot-stamping'
  posicoes JSONB,
  limites JSONB, -- { 'max_chars': 10, 'min_contrast': 4.5 }
  taxa_base_centavos INT NOT NULL DEFAULT 0
);
COMMENT ON TABLE public.personalizacao IS 'Regras de negócio para personalização (DNA OLIE).';

-- 7. Item de Personalização (Instância)
CREATE TABLE public.item_personalizacao (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Ligado diretamente ao item do pedido (que criaremos depois)
  order_item_id uuid NOT NULL, -- (Será referenciado na migração 002)
  personalizacao_id uuid NOT NULL REFERENCES public.personalizacao(id),
  valor TEXT, -- 'R.S.'
  detalhes JSONB, -- { 'fonte': 'Handmade', 'cor_linha': '#EEE9DD' }
  prova_visual_ref TEXT
);
COMMENT ON TABLE public.item_personalizacao IS 'Instância da personalização (serviço) em um pedido.';

-- 8. Habilitação de RLS (Item 7)
ALTER TABLE public.inventory_raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variante ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atributos_variante ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bom_componente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalizacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_personalizacao ENABLE ROW LEVEL SECURITY;

-- 9. Políticas de RLS (Item 7)
-- AdminGeral: Acesso Total
CREATE POLICY "RLS: AdminGeral - Acesso Total (inventory_raw_materials)" ON public.inventory_raw_materials FOR ALL USING ( (auth.jwt() ->> 'role') = 'AdminGeral' );
CREATE POLICY "RLS: AdminGeral - Acesso Total (produto)" ON public.produto FOR ALL USING ( (auth.jwt() ->> 'role') = 'AdminGeral' );
CREATE POLICY "RLS: AdminGeral - Acesso Total (variante)" ON public.variante FOR ALL USING ( (auth.jwt() ->> 'role') = 'AdminGeral' );
CREATE POLICY "RLS: AdminGeral - Acesso Total (atributos_variante)" ON public.atributos_variante FOR ALL USING ( (auth.jwt() ->> 'role') = 'AdminGeral' );
CREATE POLICY "RLS: AdminGeral - Acesso Total (bom_componente)" ON public.bom_componente FOR ALL USING ( (auth.jwt() ->> 'role') = 'AdminGeral' );
CREATE POLICY "RLS: AdminGeral - Acesso Total (personalizacao)" ON public.personalizacao FOR ALL USING ( (auth.jwt() ->> 'role') = 'AdminGeral' );
CREATE POLICY "RLS: AdminGeral - Acesso Total (item_personalizacao)" ON public.item_personalizacao FOR ALL USING ( (auth.jwt() ->> 'role') = 'AdminGeral' );

-- Producao: Acesso Leitura (SELECT)
CREATE POLICY "RLS: Producao - Acesso Leitura (inventory_raw_materials)" ON public.inventory_raw_materials FOR SELECT USING ( (auth.jwt() ->> 'role') = 'Producao' );
CREATE POLICY "RLS: Producao - Acesso Leitura (produto)" ON public.produto FOR SELECT USING ( (auth.jwt() ->> 'role') = 'Producao' );
CREATE POLICY "RLS: Producao - Acesso Leitura (variante)" ON public.variante FOR SELECT USING ( (auth.jwt() ->> 'role') = 'Producao' );
CREATE POLICY "RLS: Producao - Acesso Leitura (atributos_variante)" ON public.atributos_variante FOR SELECT USING ( (auth.jwt() ->> 'role') = 'Producao' );
CREATE POLICY "RLS: Producao - Acesso Leitura (bom_componente)" ON public.bom_componente FOR SELECT USING ( (auth.jwt() ->> 'role') = 'Producao' );
CREATE POLICY "RLS: Producao - Acesso Leitura (personalizacao)" ON public.personalizacao FOR SELECT USING ( (auth.jwt() ->> 'role') = 'Producao' );
-- (item_personalizacao será lido via Pedido)

-- Outros (Vendas, etc.) podem ler o catálogo
CREATE POLICY "RLS: Outros - Acesso Leitura (Catálogo)" ON public.produto FOR SELECT USING ( (auth.jwt() ->> 'role') IN ('Vendas', 'Conteudo', 'Administrativo') );
CREATE POLICY "RLS: Outros - Acesso Leitura (Variantes)" ON public.variante FOR SELECT USING ( (auth.jwt() ->> 'role') IN ('Vendas', 'Conteudo', 'Administrativo') );
CREATE POLICY "RLS: Outros - Acesso Leitura (Regras Personalizacao)" ON public.personalizacao FOR SELECT USING ( (auth.jwt() ->> 'role') IN ('Vendas', 'Conteudo', 'Administrativo') );


COMMIT;
