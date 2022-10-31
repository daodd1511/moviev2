import { api } from '..';

import { SearchResponseDto } from '../dtos/search.dto';
import { SearchMapper } from '../mappers/search.mapper';

import { MovieSearch, TvSearch } from '@/models/search.model';

export namespace SearchService {
  export const multi = async(query: string): Promise<Array<MovieSearch | TvSearch>> => {
    const response = await api.get<SearchResponseDto>(`/search/multi?query=${query}`);
    return SearchMapper.fromDto(response.data);
  };
}
