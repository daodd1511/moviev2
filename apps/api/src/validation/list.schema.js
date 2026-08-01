import { z } from 'zod';

export const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid id.');

export const listIdParamsSchema = z.object({ id: mongoIdSchema }).strict();

export const publicListParamsSchema = z
  .object({
    username: z.string().trim().min(1).max(30),
    listId: mongoIdSchema,
  })
  .strict();

// Matches the web app's Media model exactly (apps/web/src/models/media.model.ts) — this
// is what's actually stored in a list's `movies`/`tvShows` arrays, whether it arrives via
// the dedicated add/remove routes or a full list update.
export const mediaSchema = z
  .object({
    id: z.number().int().positive(),
    posterPath: z.string().max(500).nullable(),
    releaseDate: z.string().max(30),
    title: z.string().trim().min(1).max(300),
    voteAverage: z.number().min(0).max(10),
    type: z.enum(['movie', 'tv']),
  })
  .strict();

export const listBodySchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    description: z.string().trim().max(2000).nullable().optional(),
    movies: z.array(mediaSchema).max(1000).optional(),
    tvShows: z.array(mediaSchema).max(1000).optional(),
  })
  .strict();
