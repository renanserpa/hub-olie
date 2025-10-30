import { z } from 'zod';

export const initializerSyncStateSchema = z.object({
  id: z.string().uuid(),
  module: z.string().min(1),
  last_commit: z.string().optional(),
  last_diff: z.string().optional(),
  updated_at: z.string().datetime(),
});
