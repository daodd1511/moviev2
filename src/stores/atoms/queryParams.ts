import { atomWithHash } from 'jotai-location';

import { SortBy, SortOrder } from '@/shared/enums/sort';
import { MovieQueryParams } from '@/models/movie/movieQueryParams.model';

const initialQueryParams: MovieQueryParams = {
  page: 1,
  sortBy: SortBy.Popularity,
  sortOrder: SortOrder.Desc,
  withGenres: [],
  year: '',
  releaseDateGte: undefined,
  releaseDateLte: undefined,
};

export const movieQueryParamsAtom = atomWithHash('queryParamsAtom', initialQueryParams);
