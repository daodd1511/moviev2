import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ListService } from '@/api/services/listService';
import { List } from '@/models';

export namespace ListQueries {
  export const useAll = (enable?: boolean) =>
    useQuery<List[]>({
      queryKey: ['lists'],
      queryFn: ListService.getAll,
      enabled: enable !== false,
    });

  export const useById = (id: string) =>
    useQuery<List, AxiosError>({
      queryKey: ['listDetail', id],
      queryFn: () => ListService.getById(id),
    });

  export const usePublicList = (username: string, listId: string) =>
    useQuery<List>({
      queryKey: ['publicList', username, listId],
      queryFn: () => ListService.getPublicList(username, listId),
    });
}
