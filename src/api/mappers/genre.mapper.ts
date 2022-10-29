import { GenreDto } from '../dtos';

import { Genre } from '../../models';

export namespace GenreMapper {

  /**
   * Maps GenreDto to Genre model.
   * @param dto Genre dto.
   */
  export function fromDto(dto: GenreDto): Genre {
    return new Genre({
      id: dto.id,
      name: dto.name,
    });
  }
}
