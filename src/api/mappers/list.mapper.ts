import { ListDto } from '../dtos/list.dto';

import { List } from '@/models';

export namespace ListMapper {

  /**
   * Maps ListDto to List model.
   * @param dto List dto.
   */
  export function fromDto(dto: ListDto): List {
    return new List({
      id: dto._id,
      name: dto.name,
      description: dto.description,
      movies: dto.movies,
      tvShows: dto.tvShows,
      createAt: new Date(dto.createAt),
      updateAt: new Date(dto.updateAt),
    });
  }
}
