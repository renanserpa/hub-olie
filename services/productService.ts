import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';

export const productService = {
  async createProduct(data: any, userId: string) {
    // 1. Validar dados essenciais
    if (!data.base_sku || !data.base_price || !data.name) {
        throw new Error("Dados incompletos: Nome, SKU e Preço Base são obrigatórios.");
    }

    // 2. Inserir Produto Mestre
    // Importante: Campos opcionais devem ser inicializados para evitar erros de 'null'
    const productPayload = {
        name: data.name,
        description: data.description || '',
        status: data.status || 'Rascunho',
        created_by: userId,
        base_sku: data.base_sku,
        base_price: typeof data.base_price === 'string' ? parseFloat(data.base_price) : data.base_price,
        category: data.category || 'Geral',
        available_sizes: [],
        configurable_parts: [],
        combination_rules: [],
        base_bom: [],
        attributes: {},
        images: [],
        updated_at: new Date().toISOString()
    };

    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert(productPayload)
      .select()
      .single();

    if (productError) {
      console.error("Erro ao criar produto:", productError);
      throw new Error(`Erro ao criar produto: ${productError.message}`);
    }

    // 3. Inserir Variação Padrão (Default Variant)
    // Lógica Transacional Manual: Se falhar aqui, devemos deletar o produto criado.
    try {
        const { error: variantError } = await supabase
        .from('product_variants')
        .insert({
            product_base_id: newProduct.id,
            sku: data.base_sku, // SKU da variante padrão é o mesmo do produto base
            name: `${data.name} (Padrão)`,
            sales_price: productPayload.base_price,
            final_price: productPayload.base_price,
            unit_of_measure: 'UN',
            stock_quantity: 0,
            configuration: {}
        });

        if (variantError) throw variantError;

    } catch (error: any) {
        console.error("Erro ao criar variante padrão. Iniciando Rollback...", error);
        // ROLLBACK
        await supabase.from('products').delete().eq('id', newProduct.id);
        throw new Error(`Falha na criação da variante padrão: ${error.message}`);
    }

    return newProduct;
  },

  async updateProduct(id: string, data: Partial<Product>) {
    // Garantir que números sejam números
    const payload = { ...data };
    if (payload.base_price) {
        payload.base_price = typeof payload.base_price === 'string' ? parseFloat(payload.base_price) : payload.base_price;
    }

    const { data: product, error } = await supabase
      .from('products')
      .update({ 
        ...payload,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return product;
  }
};