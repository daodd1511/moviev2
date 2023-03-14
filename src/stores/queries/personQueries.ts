import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { PersonService } from '@/api/services/personService';

export namespace PersonQueries {
  export const useDetail = (id: number) => useQuery<
    any,
    AxiosError
  >(
    ['personDetail', id],
    () => PersonService.fetchPerson(id),

  );
}
