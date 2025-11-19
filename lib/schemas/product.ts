import { z } from 'zod';

export const productSchema = z.object({
  name: z.string()
    .trim()
    .min(3, { message: "O nome do produto deve ter pelo menos 3 caracteres." })
    .max(80, { message: "O nome do produto não pode ter mais de 80 caracteres." }),
  base_sku: z.string()
    .trim()
    .toUpperCase()
    .min(3, { message: "O SKU base deve ter pelo menos 3 caracteres." })
    .max(30, { message: "O SKU base não pode ter mais de 30 caracteres." })
    .regex(/^[A-Z0-9-]*$/, { message: "SKU deve conter apenas letras maiúsculas, números e hifens (sem espaços)." }),
  base_price: z.preprocess(
    (val) => (typeof val === 'string' || val === '' ? parseFloat(val as string) : val),
    z.number().min(0, { message: "O preço base não pode ser negativo." })
  ),
  category: z.string().min(1, { message: "A categoria é obrigatória." }),
}).passthrough();