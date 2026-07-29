import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { SearchService } from '@/api/services/searchService';
import { MovieSearch, TvSearch } from '@/models/search.model';

export namespace SearchQueries {
  export const useMulti = (query: string) =>
    useQuery<Array<MovieSearch | TvSearch>, AxiosError>({
      queryKey: ['search', query],
      queryFn: () => SearchService.multi(query),
      enabled: query.length >= 2,
    });
}
