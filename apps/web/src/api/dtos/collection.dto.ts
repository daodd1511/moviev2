import { z } from 'zod';

const collectionMediaTypeSchema = z.enum(['movie', 'tv']);
const collectionItemKeySchema = z
  .object({
    mediaType: collectionMediaTypeSchema,
    tmdbId: z.number().int().positive(),
  })
  .strict();

export const collectionItemDtoSchema = collectionItemKeySchema
  .extend({
    title: z.string().min(1),
    posterPath: z.string().nullable(),
    releaseDate: z.string(),
    voteAverage: z.number().min(0).max(10),
  })
  .strict();

export const collectionDtoSchema = z
  .object({
    id: z.string().min(1),
    ownerId: z.string().min(1),
    name: z.string().min(1),
    description: z.string().nullable(),
    visibility: z.enum(['private', 'unlisted', 'public']),
    items: z.array(collectionItemDtoSchema),
    collaborators: z.array(
      z
        .object({
          userId: z.string().min(1),
          role: z.enum(['owner', 'editor', 'viewer']),
        })
        .strict(),
    ),
    cover: collectionItemKeySchema.nullable(),
    version: z.number().int().nonnegative(),
    legacyPublicId: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .strict();

export const collectionListDtoSchema = z
  .object({ collections: z.array(collectionDtoSchema) })
  .strict();

const legacyMediaDtoSchema = z
  .object({
    id: z.number().int().positive(),
    title: z.string(),
    posterPath: z.string().nullable(),
    releaseDate: z.string(),
    voteAverage: z.number().min(0).max(10),
  })
  .passthrough();

export const legacyPublicListDtoSchema = z
  .object({
    _id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().nullable().optional(),
    movies: z.array(legacyMediaDtoSchema),
    tvShows: z.array(legacyMediaDtoSchema),
    createAt: z.string().optional(),
    updateAt: z.string().optional(),
  })
  .passthrough();

export type CollectionDto = z.infer<typeof collectionDtoSchema>;
export type LegacyPublicListDto = z.infer<typeof legacyPublicListDtoSchema>;
