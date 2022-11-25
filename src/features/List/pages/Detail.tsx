import { useParams } from 'react-router-dom';

import { assertNonNull } from '@/shared/utils';
import { ListQueries } from '@/stores/queries/listQueries';
import { Loader } from '@/shared/components';

const ListDetailComponent = () => {
  const { id } = useParams<{ id: string; }>();
  assertNonNull(id);
  const { data, error, isLoading } = ListQueries.useById(id);

  if (isLoading) {
    return <Loader className="h-withoutNavbar"/>;
  }

  if (error) {
    return <p>Error!</p>;
  }

  return (
    <div>
      <h1>{data?.name}</h1>
      <p>{data?.description}</p>
    </div>
  );
};

export const Detail = ListDetailComponent;
