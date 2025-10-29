import { z } from 'zod';

export const poItemSchema = z.object({
  material_id: z.string().uuid("Selecione um material válido."),
  quantity: z.number().min(0.01, "A quantidade deve ser maior que zero."),
  unit_price: z.number().min(0, "O preço unitário não pode ser negativo."),
});
