import { z } from 'zod';

import { mongoIdSchema } from './list.schema.js';

export const collectionVisibilitySchema = z.enum(['private', 'unlisted', 'public']);
export const collectionItemSchema = z
  .object({
    mediaType: z.enum(['movie', 'tv']),
    tmdbId: z.number().int().positive(),
    title: z.string().trim().min(1).max(300),
    posterPath: z.string().max(500).nullable(),
    releaseDate: z.string().max(30),
    voteAverage: z.number().min(0).max(10),
  })
  .strict();

export const collectionCollaboratorSchema = z
  .object({
    userId: mongoIdSchema,
    role: z.enum(['owner', 'editor', 'viewer']),
  })
  .strict();

export const collectionInputSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    description: z.string().trim().max(2000).nullable().optional(),
    visibility: collectionVisibilitySchema.default('private'),
    items: z.array(collectionItemSchema).max(1000).default([]),
    collaborators: z.array(collectionCollaboratorSchema).max(100).default([]),
    cover: z
      .object({ mediaType: z.enum(['movie', 'tv']), tmdbId: z.number().int().positive() })
      .strict()
      .nullable()
      .default(null),
    version: z.number().int().nonnegative().default(0),
  })
  .strict();
