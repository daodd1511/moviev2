import { api } from '..';
import { PersonMapper } from '@/api/mappers';
import { Person } from '@/models';
import { PersonCombinedCreditsMapper } from '@/api/mappers/person/personCombinedCredits.mapper';
import { PersonCombinedCredits } from '@/models';

export namespace PersonService {
  export async function fetchPerson(id: number): Promise<Person> {
    const { data } = await api.get<any>(`/person/${id}`);
    return PersonMapper.fromDto(data);
  }
  
  export async function getCombinedCredits(id: number): Promise<PersonCombinedCredits> {
    const { data } = await api.get<any>(`/person/${id}/combined_credits`);
    return PersonCombinedCreditsMapper.fromDto(data);
  }
}
