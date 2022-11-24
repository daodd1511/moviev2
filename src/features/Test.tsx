import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { useEffect } from 'react';

import { ListService } from '@/api/services/listService';
import { List } from '@/models';

export const Test = () => {
  const listId = '637eeb8be576b6cdfc0018a9';
  const queryClient = useQueryClient();
  const { data: lists, isLoading: isListsLoading, isError, error } = useQuery<readonly List[]>(
    ['test'],
    ListService.getAll,
  );

  const { data: list, isLoading: isListLoading } = useQuery<List>(
    ['test2', listId],
    () => ListService.getById(listId),
  );

  const createMutation = useMutation({
    mutationFn: () =>
      ListService.create({ name: 'test', description: 'test' } as List),
    onSuccess() {
      queryClient.invalidateQueries('test');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ListService.remove(id),
    onSuccess() {
      queryClient.invalidateQueries('test');
    },
  });

  const addMutation = useMutation({
    mutationFn: (id: string) =>
      ListService.addTv(id, 12),
    onSuccess() {
      queryClient.invalidateQueries('test');
    },
    onError(error) {
      toast.error(error.response?.data.message);
    },
  });

  const onCreateClick = () => {
    createMutation.mutate();
  };

  const onDeleteClick = (id: string) => {
    deleteMutation.mutate(id);
  };

  const onAddClick = (id: string) => {
    addMutation.mutate(id);
  };

  if (isListsLoading || isListLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <pre>{JSON.stringify(list, null, 2)}</pre>
      <button onClick={onCreateClick}>Create</button>
      <div>
        {lists?.map(l => (
          <div key={l.id} className="border border-emerald-100">
            <pre>{JSON.stringify(l, null, 2)}</pre>
            <button onClick={() => onDeleteClick(l.id)}>Delete</button>
            <button onClick={() => onAddClick(l.id)}>Add</button>
          </div>
        ))}
      </div>
    </div>
  );
};
