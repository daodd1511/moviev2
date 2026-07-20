import { CastDto } from '../dtos';

import { Cast } from '@/models';

export namespace CastMapper {

  /**
   * Maps CastDto to Cast model.
   * @param dto Cast dto.
   */
  export function fromDto(dto: CastDto): Cast {
    return {
      id: dto.id,
      name: dto.name,
      character: dto.character,
      profilePath: dto.profile_path,
      order: dto.order,
    };
  }
}
