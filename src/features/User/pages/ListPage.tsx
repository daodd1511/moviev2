import { Link } from 'react-router-dom';

import { Loader } from '@/shared/components';
import { ListQueries } from '@/stores/queries/listQueries';

export const ListPage = () => {
    const { data, isLoading } = ListQueries.useAll();

    if (isLoading) {
        return <Loader className="h-withoutNavbar"/>;
    }
    return (
      <div className="px-8 py-12">
        <div className="flex justify-between items-center">
          <h1>My list</h1>
          <Link to="/list/new" className="btn btn-sm btn-outline btn-primary">Create</Link>
        </div>
        <div>
          {data?.map(list => (
            <div key={list.id}>
              <Link to={`/list/${list.id}`}>{list.name}</Link>
            </div>
          ))}
        </div>
      </div>
    );
};
