import { z } from 'zod';

export const kpiSchema = z.object({
  id: z.string(),
  module: z.enum(['orders', 'production', 'inventory', 'logistics', 'financial', 'marketing', 'overview']),
  name: z.string(),
  value: z.union([z.string(), z.number()]),
  trend: z.number().optional(),
  unit: z.string().optional(),
  description: z.string(),
});
