import { z } from 'zod';

import { mongoIdSchema } from './list.schema.js';

export const usernameParamsSchema = z
  .object({ username: z.string().trim().min(1).max(50) })
  .strict();

export const collectionIdParamsSchema = z.object({ id: mongoIdSchema }).strict();

export const discoverCollectionsQuerySchema = z
  .object({
    sort: z.enum(['popular', 'newest']).default('newest'),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
  })
  .strict();
