import { z } from 'zod';

export const createPOSchema = z.object({
  supplier_id: z.string().uuid("Selecione um fornecedor válido."),
  // Items will be validated separately
});
