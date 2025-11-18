
import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';

export const productService = {
  async createProduct(data: any, userId: string) {
    // 1. Inserir Produto Mestre
    // Nota: base_sku e base_price são persistidos no produto mestre para referência rápida
    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert({
        name: data.name,
        description: data.description,
        status: data.status,
        created_by: userId,
        base_sku: data.base_sku,
        base_price: parseFloat(data.base_price),
        category: data.category
      })
      .select()
      .single();

    if (productError) {
      throw new Error(`Erro ao criar produto: ${productError.message}`);
    }

    // 2. Inserir Variação Padrão
    // Mapeia base_sku e base_price do formulário para sku e sales_price da variante
    const { error: variantError } = await supabase
      .from('product_variants')
      .insert({
        product_base_id: newProduct.id, // Correção: usando product_base_id conforme schema
        sku: data.base_sku,
        name: `${data.name} (Padrão)`,
        sales_price: parseFloat(data.base_price),
        final_price: parseFloat(data.base_price),
        unit_of_measure: 'UN',
        stock_quantity: 0
      });

    if (variantError) {
      // ROLLBACK MANUAL: Se falhar na variante, apaga o produto mestre para manter consistência
      console.error("Erro ao criar variante, revertendo produto...", variantError);
      await supabase.from('products').delete().eq('id', newProduct.id);
      throw new Error(`Erro ao criar variação padrão: ${variantError.message}`);
    }

    return newProduct;
  },

  async updateProduct(id: string, data: Partial<Product>) {
    // Atualização foca apenas no produto mestre por enquanto
    const { data: product, error } = await supabase
      .from('products')
      .update({ 
        name: data.name,
        description: data.description,
        status: data.status,
        category: data.category,
        base_sku: data.base_sku,
        base_price: data.base_price,
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
