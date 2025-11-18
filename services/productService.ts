
import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';

export const productService = {
  async createProduct(data: Partial<Product>, userId: string) {
    const { data: product, error } = await supabase
      .from('products')
      .insert({ ...data, created_by: userId })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return product;
  },

  async updateProduct(id: string, data: Partial<Product>) {
    const { data: product, error } = await supabase
      .from('products')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return product;
  }
};
