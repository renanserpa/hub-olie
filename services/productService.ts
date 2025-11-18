
import { supabase } from '../lib/supabaseClient';
import { Product, ProductStatus } from '../types';

interface CreateProductInput {
  name: string;
  description?: string;
  status: ProductStatus;
  base_price: number | string;
  base_sku: string;
}

export const productService = {
  async createProduct(data: CreateProductInput, userId: string) {
    // 1. Inserir Produto Mestre
    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert({
        name: data.name,
        description: data.description,
        status: data.status,
        base_sku: data.base_sku,
        base_price: parseFloat(String(data.base_price)),
        created_by: userId
      })
      .select()
      .single();

    if (productError) {
      throw new Error(`Erro ao criar produto: ${productError.message}`);
    }

    try {
      // 2. Inserir Variação Padrão
      // Mapeia base_sku e base_price do formulário para sku e sales_price da variante
      const { error: variantError } = await supabase
        .from('product_variants')
        .insert({
          product_id: newProduct.id,
          sku: data.base_sku,
          sales_price: parseFloat(String(data.base_price)),
          unit_of_measure: 'UN' // Padrão inicial
        });

      if (variantError) {
        throw variantError;
      }
    } catch (variantError: any) {
      // ROLLBACK MANUAL: Se falhar na variante, apaga o produto mestre para manter consistência
      await supabase.from('products').delete().eq('id', newProduct.id);
      throw new Error(`Erro ao criar variação padrão: ${variantError.message}`);
    }

    return newProduct;
  },

  async updateProduct(id: string, data: Partial<Product>) {
    // Atualização foca apenas no produto mestre por enquanto
    // As variantes seriam gerenciadas em uma interface dedicada de edição
    const { data: product, error } = await supabase
      .from('products')
      .update({ 
        name: data.name,
        description: data.description,
        status: data.status,
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
