import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { PersonService } from '@/api/services/personService';
import { Person, PersonCombinedCredits } from '@/models';

export namespace PersonQueries {
  export const useDetail = (id: number) => useQuery<
    Person,
    AxiosError
  >(
    ['personDetail', id],
    () => PersonService.fetchPerson(id),
  );
  
  export const useCombinedCredits = (id: number) => useQuery<
    PersonCombinedCredits,
    AxiosError
  >(
    ['personCombinedCredits', id],
    () => PersonService.getCombinedCredits(id),
  );
}
