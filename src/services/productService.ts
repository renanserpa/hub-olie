import { supabase } from '../lib/supabaseClient';
import { Product, CreateProductData } from '../types';

export const productService = {
  /**
   * Cria um produto e sua variação padrão de forma "transacional".
   * Se a criação da variação falhar, o produto base é removido (rollback manual).
   */
  async createProduct(data: CreateProductData, userId: string): Promise<Product> {
    // 1. Validar dados essenciais
    if (!data.base_sku || data.base_price === undefined || !data.name) {
        throw new Error("Dados incompletos: Nome, SKU e Preço Base são obrigatórios.");
    }

    // Conversão segura de preço para número
    const basePrice = typeof data.base_price === 'string' ? parseFloat(data.base_price) : data.base_price;

    // 2. Preparar payload do Produto Mestre
    const productPayload = {
        name: data.name,
        description: data.description || '',
        status: data.status || 'Rascunho',
        created_by: userId,
        base_sku: data.base_sku,
        base_price: basePrice,
        category: data.category || 'Geral',
        // Campos JSONB/Array inicializados vazios para evitar null e permitir edição posterior
        available_sizes: data.available_sizes || [],
        configurable_parts: data.configurable_parts || [],
        combination_rules: [],
        base_bom: [],
        attributes: {},
        images: [],
        updated_at: new Date().toISOString()
    };

    // 3. Inserir Produto Mestre
    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert(productPayload)
      .select()
      .single();

    if (productError) {
      console.error("Erro ao criar produto:", productError);
      throw new Error(`Erro ao criar produto: ${productError.message}`);
    }

    // 4. Inserir Variação Padrão (Default Variant)
    try {
        const variantPayload = {
            product_base_id: newProduct.id,
            sku: data.base_sku, // SKU da variante padrão é o mesmo do produto base
            name: `${data.name} (Padrão)`,
            sales_price: basePrice,
            final_price: basePrice,
            unit_of_measure: 'UN',
            stock_quantity: 0,
            configuration: {}
        };

        const { error: variantError } = await supabase
            .from('product_variants')
            .insert(variantPayload);

        if (variantError) throw variantError;

    } catch (error: any) {
        console.error("Erro ao criar variante padrão. Iniciando Rollback...", error);
        
        // ROLLBACK MANUAL: Deletar o produto criado se a variante falhar
        const { error: deleteError } = await supabase.from('products').delete().eq('id', newProduct.id);
        
        if (deleteError) {
            console.error("CRÍTICO: Falha no rollback do produto.", deleteError);
        }

        throw new Error(`Falha na criação da variante padrão: ${error.message}`);
    }

    return newProduct;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const payload = { ...data };
    
    // Garantir tipagem numérica se o campo estiver presente
    if (payload.base_price !== undefined) {
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