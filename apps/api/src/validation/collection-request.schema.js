import { z } from 'zod';

import {
  collectionInputSchema,
  collectionItemSchema,
  collectionVisibilitySchema,
} from './collection.schema.js';
import { mongoIdSchema } from './list.schema.js';

export const collectionIdParamsSchema = z.object({ id: mongoIdSchema }).strict();
export const collectionItemParamsSchema = z
  .object({
    id: mongoIdSchema,
    mediaType: z.enum(['movie', 'tv']),
    tmdbId: z.coerce.number().int().positive(),
  })
  .strict();
export const versionSchema = z.number().int().nonnegative();
export const createCollectionSchema = collectionInputSchema.omit({
  collaborators: true,
  version: true,
});
export const updateCollectionSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    visibility: collectionVisibilitySchema.optional(),
    cover: z
      .object({ mediaType: z.enum(['movie', 'tv']), tmdbId: z.number().int().positive() })
      .strict()
      .nullable()
      .optional(),
    version: versionSchema,
  })
  .strict();
export const addCollectionItemSchema = z
  .object({ item: collectionItemSchema, version: versionSchema })
  .strict();
export const reorderCollectionItemsSchema = z
  .object({
    items: z
      .array(
        z
          .object({ mediaType: z.enum(['movie', 'tv']), tmdbId: z.number().int().positive() })
          .strict(),
      )
      .max(1000),
    version: versionSchema,
  })
  .strict()
  .superRefine((body, context) => {
    const keys = body.items.map(item => `${item.mediaType}:${item.tmdbId}`);
    if (new Set(keys).size !== keys.length)
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['items'],
        message: 'Item keys must be unique.',
      });
  });
export const removeCollectionSchema = z.object({ version: versionSchema }).strict();
