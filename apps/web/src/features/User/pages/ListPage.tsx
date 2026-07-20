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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data?.map(list => (
            <div key={list.id} >
              <Link to={`/list/${list.id}`}>
                <div className="card w-full h-full bg-base-100 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
                  <div className="card-body">
                    <h2 className="card-title">{list.name}</h2>
                    <p>{list.description}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
};
