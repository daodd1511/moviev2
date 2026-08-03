import { z } from 'zod';

import { collectionItemDtoSchema } from './collection.dto';

const collectionItemKeyDtoSchema = z
  .object({
    mediaType: z.enum(['movie', 'tv']),
    tmdbId: z.number().int().positive(),
  })
  .strict();

export const socialProfileDtoSchema = z
  .object({
    username: z.string().min(1),
    firstName: z.string(),
    lastName: z.string(),
    followerCount: z.number().int().nonnegative(),
    followingCount: z.number().int().nonnegative(),
    isFollowedByViewer: z.boolean(),
  })
  .strict();

export const followersDtoSchema = z.object({ followers: z.array(z.string()) }).strict();
export const followingDtoSchema = z.object({ following: z.array(z.string()) }).strict();

export const publicCollectionSummaryDtoSchema = z
  .object({
    id: z.string().min(1),
    ownerUsername: z.string().min(1),
    name: z.string().min(1),
    description: z.string().nullable(),
    cover: collectionItemKeyDtoSchema.nullable(),
    itemCount: z.number().int().nonnegative(),
    likeCount: z.number().int().nonnegative(),
    createdAt: z.string(),
  })
  .strict();

export const discoverCollectionsDtoSchema = z
  .object({ collections: z.array(publicCollectionSummaryDtoSchema) })
  .strict();

export const publicCollectionDtoSchema = z
  .object({
    id: z.string().min(1),
    ownerUsername: z.string().min(1),
    name: z.string().min(1),
    description: z.string().nullable(),
    visibility: z.enum(['private', 'unlisted', 'public']),
    cover: collectionItemKeyDtoSchema.nullable(),
    items: z.array(collectionItemDtoSchema),
    itemCount: z.number().int().nonnegative(),
    likeCount: z.number().int().nonnegative(),
    isLikedByViewer: z.boolean(),
    createdAt: z.string(),
  })
  .strict();

export type SocialProfileDto = z.infer<typeof socialProfileDtoSchema>;
export type PublicCollectionSummaryDto = z.infer<typeof publicCollectionSummaryDtoSchema>;
export type PublicCollectionDto = z.infer<typeof publicCollectionDtoSchema>;
