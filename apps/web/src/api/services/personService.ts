import { api } from '..';

import { PersonMapper } from '@/api/mappers';
import { PersonCombinedCreditsDto, PersonDto } from '@/api/dtos';
import { Person, PersonCombinedCredits } from '@/models';
import { PersonCombinedCreditsMapper } from '@/api/mappers/person/personCombinedCredits.mapper';

export namespace PersonService {
  /**
   * Fetches a person's details.
   * @param id Person ID.
   */
  export async function fetchPerson(id: number): Promise<Person> {
    const { data } = await api.get<PersonDto>(`/person/${id}`);
    return PersonMapper.fromDto(data);
  }

  /**
   * Fetches a person's combined movie and TV credits.
   * @param id Person ID.
   */
  export async function getCombinedCredits(id: number): Promise<PersonCombinedCredits> {
    const { data } = await api.get<PersonCombinedCreditsDto>(`/person/${id}/combined_credits`);
    return PersonCombinedCreditsMapper.fromDto(data);
  }
}
