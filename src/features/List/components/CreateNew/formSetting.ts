import { z } from 'zod';

import { FORM_ERROR_MESSAGES } from '@/shared/constants/formErrorMessages';

const movieSchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string(),
  releaseDate: z.string(),
  posterPath: z.string(),
  backdropPath: z.string(),
  popularity: z.number(),
  voteAverage: z.number(),
  voteCount: z.number(),
  adult: z.boolean(),
  originalLanguage: z.string(),
  originalTitle: z.string(),
  genreIds: z.array(z.number()),
});

const tvShowsSchema = z.object({
  id: z.number(),
  name: z.string(),
  overview: z.string(),
  firstAirDate: z.string(),
  posterPath: z.string(),
  backdropPath: z.string(),
  popularity: z.number(),
  voteAverage: z.number(),
  voteCount: z.number(),
  originalLanguage: z.string(),
  originalName: z.string(),
  genreIds: z.array(z.number()),
});

export const listSchema = z.object({
  name: z.string().min(1, { message: FORM_ERROR_MESSAGES.required })
    .max(255, { message: FORM_ERROR_MESSAGES.max }),
  description: z.string(),
  movies: z.array(movieSchema).default([]),
  tvShows: z.array(tvShowsSchema).default([]),
});
