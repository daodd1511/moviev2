import { useQuery } from '@tanstack/react-query';

import { ListService } from '@/api/services/listService';
import { List } from '@/models';

export const Test = () => {
    const { data, isLoading } = useQuery<readonly List[]>(['test'], ListService.getLists);

    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
      <div><pre>{JSON.stringify(data, null, 2)}</pre></div>
    );
};
