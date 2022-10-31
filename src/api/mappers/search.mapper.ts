
import { SearchDto, SearchResponseDto } from '../dtos/search.dto';

import { MovieMapper, TvMapper } from '.';

import { MovieSearch, TvSearch } from '@/models/search.model';
import { MediaType } from '@/shared/enums/mediaType';

export namespace SearchMapper {

  /**
   * Maps Dto to model.
   * @param dto Dto.
   */
  export function fromDto(dto: SearchResponseDto): Array<MovieSearch | TvSearch> {
    const searchValuesWithoutPerson = dto.results.filter(searchValue => searchValue.media_type !== MediaType.Person);
    const searchValues = searchValuesWithoutPerson.map((result: SearchDto) => {
      if (result.media_type === 'movie') {
        return new MovieSearch({
          ...MovieMapper.fromDto(result),
          mediaType: result.media_type,
        });
      }
      return new TvSearch({
        ...TvMapper.fromDto(result),
        mediaType: result.media_type,
      });
    });
    return searchValues;
  }
}
