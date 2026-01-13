import { z } from 'zod';

export const logStatusSchema = z.enum(['running', 'success', 'error', 'info']);

export const initializerLogSchema = z.object({
  id: z.string().uuid(),
  agent_name: z.string().min(1),
  module: z.string().optional(),
  action: z.string(),
  status: logStatusSchema,
  timestamp: z.string().datetime(),
  metadata: z.any().optional(),
});
