import { z } from 'zod';

export const aiInsightSchema = z.object({
  id: z.string(),
  module: z.enum(['overview', 'financial', 'production', 'sales', 'logistics', 'purchasing', 'ai_insights']),
  type: z.enum(['opportunity', 'positive', 'risk']),
  insight: z.string(),
  period: z.string(),
  generated_at: z.string(),
});
