import { GenreDto } from '../dtos/genre.dto';
import { Genre } from '../models/genre.model';

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
