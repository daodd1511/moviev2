import { atom } from 'jotai';

import { MovieQueryParams } from '@/models/movie/movieQueryParams.model';
import { SortBy, SortOrder } from '@/shared/enums/sort';

export const queryParamsAtom = atom<MovieQueryParams>({
  page: 1,
  sortBy: SortBy.Popularity,
  sortOrder: SortOrder.Desc,
});
