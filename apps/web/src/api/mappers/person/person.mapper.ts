import { PersonDto } from '@/api/dtos';
import { Person } from '@/models';

export namespace PersonMapper {

  /**
   * Maps PersonDto to Person model.
   * @param dto Person dto.
   */
  export function fromDto(dto: PersonDto): Person {
    return new Person({
      id: dto.id,
      name: dto.name,
      biography: dto.biography,
      birthday: dto.birthday,
      deathday: dto.deathday,
      place_of_birth: dto.place_of_birth,
      profilePath: dto.profile_path,
      popularity: dto.popularity,
      knownForDepartment: dto.known_for_department,
    });
  }
}
