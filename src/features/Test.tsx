import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ListService } from '@/api/services/listService';
import { List } from '@/models';

export const Test = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<readonly List[]>(
    ['test'],
    ListService.getAll,
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

  const onCreateClick = () => {
    createMutation.mutate();
  };

  const onDeleteClick = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <button onClick={onCreateClick}>Create</button>
      <div>
        {data?.map(list => (
          <div key={list.id} className="border border-emerald-100">
            <pre>{JSON.stringify(list, null, 2)}</pre>
            <button onClick={() => onDeleteClick(list.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};
