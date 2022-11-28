import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ListService } from '@/api/services/listService';
import { List } from '@/models';

export namespace ListQueries {
  export const useAll = (enable?: boolean) => useQuery<List[]>(
    ['lists'],
    ListService.getAll,
    enable === false ? { enabled: false } : undefined,
  );

  export const useById = (id: string) => useQuery<List, AxiosError>(
    ['listDetail', id],
    () => ListService.getById(id),
  );

}
