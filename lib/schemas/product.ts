import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(3, { message: "O nome do produto deve ter pelo menos 3 caracteres." }),
  base_sku: z.string().min(3, { message: "O SKU base deve ter pelo menos 3 caracteres." }),
  base_price: z.preprocess(
    (val) => (typeof val === 'string' || val === '' ? parseFloat(val as string) : val),
    z.number({ invalid_type_error: "O preço base deve ser um número." }).min(0, { message: "O preço base não pode ser negativo." })
  ),
  category: z.string().min(1, { message: "A categoria é obrigatória." }),
}).passthrough();