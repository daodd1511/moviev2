import { useQuery } from '@tanstack/react-query';

import { ListService } from '@/api/services/listService';
import { List } from '@/models';

export namespace ListQueries {
  export const useAll = () => useQuery<List[]>(
    ['lists'],
    ListService.getAll,
  );

  export const create = (list: List) => ListService.create(list);

  export const useById = (id: string) => useQuery<List>(
    ['listDetail', id],
    () => ListService.getById(id),
  );

  export const update = (list: List) => ListService.update(list);
}
