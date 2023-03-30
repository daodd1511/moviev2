import { describe, it, expect, vi } from 'vitest';
import { AxiosStatic } from 'axios';

import { MovieService } from '../movieService';

import { api } from '@/api';

import { API_CONFIG } from '@/api/config';
import { Media } from '@/models';
import { MovieDto } from '@/api/dtos';

const movieDto1 = {
  poster_path: '/poster1.jpg',
  adult: false,
  overview: 'Overview for movie 1.',
  release_date: '2022-01-01',
  genre_ids: [1, 2, 3],
  id: 1001,
  original_title: 'Movie 1',
  original_language: 'en',
  title: 'Movie 1',
  backdrop_path: '/backdrop1.jpg',
  popularity: 7.8,
  vote_count: 1000,
  vote_average: 8.5,
};

const movieDto2 = {
  poster_path: '/poster2.jpg',
  adult: false,
  overview: 'Overview for movie 2.',
  release_date: '2022-02-01',
  genre_ids: [4, 5],
  id: 1002,
  original_title: 'Movie 2',
  original_language: 'en',
  title: 'Movie 2',
  backdrop_path: '/backdrop2.jpg',
  popularity: 6.2,
  vote_count: 750,
  vote_average: 7.1,
};

const movie1: Media = new Media(
  {
    id: 1001,
    posterPath: '/poster1.jpg',
    releaseDate: '2022-01-01',
    title: 'Movie 1',
    voteAverage: 8.5,
    type: 'movie',
  },
);

const movie2: Media = new Media({
  id: 1002,
  posterPath: '/poster2.jpg',
  releaseDate: '2022-02-01',
  title: 'Movie 2',
  voteAverage: 7.1,
  type: 'movie',
});

vi.mock('api', async() => {
  const axiosMocked = await vi.importActual<AxiosStatic>('axios');
  return {
    api: axiosMocked.create({
      baseURL: API_CONFIG.apiUrl,
      params: {
        api_key: API_CONFIG.apiKey,
      },
    }),
  };
});

describe('MovieService', () => {
    it('should get movies', async() => {
        const moviesResponse: MovieDto[] = [movieDto1, movieDto2];
        const mappedMovies: Media[] = [movie1, movie2];
        api.get = vi.fn().mockResolvedValue({ data: { results: moviesResponse } });
        const movies = await MovieService.getMovies(1);
        expect(movies.results).toEqual(mappedMovies);
    });
});
