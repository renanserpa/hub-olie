import { z } from 'zod';

export const campaignSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  description: z.string().optional(),
  status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled']),
  channels: z.array(z.enum(['email', 'sms', 'whatsapp', 'instagram'])).min(1, "Selecione pelo menos um canal."),
  segment_id: z.string().uuid("Selecione um segmento válido.").optional().nullable(),
  template_id: z.string().uuid("Selecione um template válido.").optional().nullable(),
  scheduled_at: z.string().optional().nullable(),
  budget: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0, "O orçamento não pode ser negativo.")
  ),
  // KPIs are managed by the system, not in the form
});

export const segmentRuleSchema = z.object({
  id: z.string(),
  field: z.enum(['total_spent', 'order_count', 'last_purchase_days', 'tags']),
  operator: z.enum(['greater_than', 'less_than', 'equals', 'contains', 'not_contains']),
  value: z.union([z.string().min(1, "O valor não pode ser vazio."), z.number().min(0, "O valor não pode ser negativo.")]),
});

export const segmentSchema = z.object({
  name: z.string().min(3, "O nome do segmento deve ter pelo menos 3 caracteres."),
  description: z.string().optional(),
  rules: z.array(segmentRuleSchema).min(1, "Adicione pelo menos uma regra para o segmento."),
});