import { z } from 'zod';

export const initializerSyncStateSchema = z.object({
  id: z.string().uuid(),
  module: z.string(),
  last_commit: z.string().nullable(),
  last_diff: z.string().nullable(),
  updated_at: z.string().datetime(),
});