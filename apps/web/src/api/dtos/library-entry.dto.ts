import { z } from 'zod';

const mediaTypeSchema = z.enum(['movie', 'tv']);
const watchStateSchema = z.enum(['planned', 'watching', 'completed', 'paused', 'dropped']);
const nullableDateSchema = z.string().datetime().nullable();

export const libraryEntryDtoSchema = z
  .object({
    id: z.string().min(1),
    mediaType: mediaTypeSchema,
    tmdbId: z.number().int().positive(),
    watchState: watchStateSchema,
    rating: z.number().int().min(1).max(10).nullable(),
    notes: z.string().nullable(),
    startedAt: nullableDateSchema,
    completedAt: nullableDateSchema,
    lastWatchedAt: nullableDateSchema,
    tvProgress: z
      .object({
        season: z.number().int().positive(),
        episode: z.number().int().positive(),
        watchedEpisodeCount: z.number().int().positive().nullable(),
      })
      .nullable(),
    mediaSnapshot: z.object({
      title: z.string().min(1),
      posterPath: z.string().nullable(),
      releaseDate: nullableDateSchema,
      voteAverage: z.number().min(0).max(10),
    }),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();

export const libraryEntryListDtoSchema = z.object({
  entries: z.array(libraryEntryDtoSchema),
});

export type LibraryEntryDto = z.infer<typeof libraryEntryDtoSchema>;
