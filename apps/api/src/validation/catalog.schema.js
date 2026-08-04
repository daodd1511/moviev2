import { z } from 'zod';

const mediaType = z.enum(['movie', 'tv']);
const page = z.coerce.number().int().positive().max(500).default(1);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const MOVIE_CATEGORIES = ['popular', 'top_rated', 'upcoming', 'now_playing'];
const TV_CATEGORIES = ['popular', 'top_rated', 'on_the_air', 'airing_today'];
const category = z.enum([...new Set([...MOVIE_CATEGORIES, ...TV_CATEGORIES])]);

export const catalogSearchSchema = z
  .object({
    query: z.string().trim().min(1).max(200),
    type: z.enum(['multi', 'movie', 'tv', 'person']).default('multi'),
    page,
  })
  .strict();
export const catalogDiscoverSchema = z
  .object({
    mediaType,
    category: category.optional(),
    page,
    sort_by: z.string().trim().max(80).optional(),
    with_genres: z.string().trim().max(200).optional(),
    'vote_average.gte': z.coerce.number().min(0).max(10).optional(),
    'primary_release_date.gte': date.optional(),
    'primary_release_date.lte': date.optional(),
    'first_air_date.gte': date.optional(),
    'first_air_date.lte': date.optional(),
  })
  .strict()
  .superRefine((input, ctx) => {
    if (input.category === undefined) return;
    const allowed = input.mediaType === 'movie' ? MOVIE_CATEGORIES : TV_CATEGORIES;
    if (!allowed.includes(input.category)) {
      ctx.addIssue({
        code: 'custom',
        path: ['category'],
        message: `category must be one of ${allowed.join(', ')} for mediaType "${input.mediaType}".`,
      });
    }
  });
export const catalogGenresSchema = z.object({ mediaType }).strict();
export const catalogMediaParamsSchema = z
  .object({ mediaType, id: z.coerce.number().int().positive() })
  .strict();
export const catalogScheduleSchema = z
  .object({ mediaType, from: date, to: date, page })
  .strict()
  .refine(input => input.from <= input.to, { message: 'from must precede to.', path: ['from'] });
