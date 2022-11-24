import { Link } from 'react-router-dom';

import { Loader } from '@/shared/components';
import { ListQueries } from '@/stores/queries/listQueries';

export const ListPage = () => {
    const { data, isLoading } = ListQueries.useAll();

    if (isLoading) {
        return <Loader className="h-withoutNavbar"/>;
    }
    return (
      <div>
        <h1>List page</h1>
        <Link to="/list/new">Create new list</Link>
        <div><pre>{JSON.stringify(data, null, 2)}</pre></div>
      </div>
    );
};
