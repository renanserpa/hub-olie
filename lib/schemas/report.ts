import { z } from 'zod';

// Placeholder for custom report schema
export const reportSchema = z.object({
  id: z.string(),
  name: z.string(),
  config: z.any(), // Will be a detailed JSONB schema
});
