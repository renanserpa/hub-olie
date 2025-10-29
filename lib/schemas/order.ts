import { z } from 'zod';

export const orderItemSchema = z.object({
    product_id: z.string().uuid("ID do produto inválido"),
    quantity: z.number().min(1, "A quantidade deve ser pelo menos 1"),
    // ... outros campos
});

export const createOrderSchema = z.object({
    customer_id: z.string().uuid("Selecione um cliente válido"),
    items: z.array(orderItemSchema).min(1, "O pedido deve ter pelo menos um item"),
    // ...
});