import { z } from 'zod';

export const agentStatusSchema = z.enum(['idle', 'working', 'error', 'offline']);

export const initializerAgentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  role: z.string(),
  status: agentStatusSchema,
  last_heartbeat: z.string().datetime(),
  health_score: z.number().min(0).max(1),
});
