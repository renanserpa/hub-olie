import { z } from 'zod';

export const createWaveSchema = z.object({
  orderIds: z.array(z.string().uuid()).min(1, "Selecione pelo menos um pedido para criar a onda."),
  // created_by will be added on the server/hook side
});
