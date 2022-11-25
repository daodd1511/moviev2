import { useParams } from 'react-router-dom';

import { assertNonNull } from '@/shared/utils';
import { ListQueries } from '@/stores/queries/listQueries';
import { Loader } from '@/shared/components';

const ListDetailComponent = () => {
  const { id } = useParams<{ id: string; }>();
  assertNonNull(id);
  const { data, error, isLoading } = ListQueries.useById(id);

  // console.log(data?.movies);

  if (isLoading) {
    return <Loader className="h-withoutNavbar"/>;
  }

  if (error) {
    return <p>Error!</p>;
  }

  return (
    <div className="px-8 py-12">
      <h1>{data?.name}</h1>
      <p>{data?.description}</p>
      {((data?.movies) != null) && (
        <pre>{JSON.stringify(data?.movies, null, 2)}</pre>
      )}
    </div>
  );
};

export const Detail = ListDetailComponent;
