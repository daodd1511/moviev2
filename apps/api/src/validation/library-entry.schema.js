import { z } from 'zod';

const watchStateSchema = z.enum(['planned', 'watching', 'completed', 'paused', 'dropped']);
const mediaTypeSchema = z.enum(['movie', 'tv']);
const dateSchema = z.coerce.date().nullable().optional();

const tvProgressSchema = z
  .object({
    season: z.number().int().positive(),
    episode: z.number().int().positive(),
    watchedEpisodeCount: z.number().int().positive().nullable().optional(),
  })
  .strict();

const mediaSnapshotSchema = z
  .object({
    title: z.string().trim().min(1).max(300),
    posterPath: z.string().max(500).nullable().optional(),
    releaseDate: dateSchema,
    voteAverage: z.number().min(0).max(10),
  })
  .strict();

export const upsertLibraryEntrySchema = z
  .object({
    mediaType: mediaTypeSchema,
    tmdbId: z.number().int().positive(),
    watchState: watchStateSchema.default('planned'),
    rating: z.number().int().min(1).max(10).nullable().optional(),
    notes: z.string().trim().max(5000).nullable().optional(),
    startedAt: dateSchema,
    completedAt: dateSchema,
    lastWatchedAt: dateSchema,
    tvProgress: tvProgressSchema.nullable().optional(),
    mediaSnapshot: mediaSnapshotSchema,
  })
  .strict()
  .superRefine((entry, context) => {
    if (entry.startedAt && entry.completedAt && entry.completedAt < entry.startedAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['completedAt'],
        message: 'Completion date cannot precede start date.',
      });
    }

    if (entry.mediaType === 'movie' && entry.tvProgress) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tvProgress'],
        message: 'TV progress is only valid for TV entries.',
      });
    }
  });

export const libraryEntryQuerySchema = z
  .object({
    watchState: watchStateSchema.optional(),
    mediaType: mediaTypeSchema.optional(),
    minRating: z.coerce.number().int().min(1).max(10).optional(),
    maxRating: z.coerce.number().int().min(1).max(10).optional(),
    sort: z.enum(['updatedAt', 'createdAt', 'lastWatchedAt']).default('updatedAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict()
  .superRefine((query, context) => {
    if (query.minRating && query.maxRating && query.minRating > query.maxRating) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['maxRating'],
        message: 'Maximum rating must be at least the minimum rating.',
      });
    }
  });

export const libraryEntryParamsSchema = z
  .object({
    mediaType: mediaTypeSchema,
    tmdbId: z.coerce.number().int().positive(),
  })
  .strict();
