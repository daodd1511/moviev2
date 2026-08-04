import { z } from 'zod';
const base = z.object({ id: z.number().int().positive(), popularity: z.number().nonnegative() });
const media = base.extend({
  mediaType: z.enum(['movie', 'tv']),
  title: z.string(),
  overview: z.string(),
  posterPath: z.string().nullable(),
  backdropPath: z.string().nullable(),
  releaseDate: z.string(),
  voteAverage: z.number(),
});
const person = base.extend({
  mediaType: z.literal('person'),
  name: z.string(),
  profilePath: z.string().nullable(),
});
export const catalogPageDtoSchema = z.object({
  page: z.number().int().positive(),
  totalPages: z.number().int().positive(),
  results: z.array(z.union([media, person])),
});
export const catalogGenreDtoSchema = z.array(
  z.object({ id: z.number().int().positive(), name: z.string() }),
);
