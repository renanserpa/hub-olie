import { z } from 'zod';

export const executiveKpiSchema = z.object({
  id: z.string(),
  module: z.enum(['overview', 'financial', 'production', 'sales', 'logistics', 'purchasing', 'ai_insights']),
  name: z.string(),
  value: z.union([z.string(), z.number()]),
  trend: z.number(),
  unit: z.string().optional(),
  period: z.string(),
  description: z.string(),
});
