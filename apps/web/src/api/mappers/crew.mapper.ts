import { CrewDto } from '../dtos';

import { Crew } from '@/models';

export namespace CrewMapper {

  /**
   * Maps CrewDto to Crew model.
   * @param dto Crew dto.
   */
  export function fromDto(dto: CrewDto): Crew {
    return {
      id: dto.id,
      name: dto.name,
      job: dto.job,
      department: dto.department,
      profilePath: dto.profile_path,
    };
  }
}