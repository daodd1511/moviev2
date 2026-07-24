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
          <Link to="/list/new" className="rounded-lg border border-cPrimary px-3 py-1.5 text-sm text-cPrimary hover:bg-cPrimary hover:text-white">Create</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data?.map(list => (
            <div key={list.id} >
              <Link to={`/list/${list.id}`}>
                <div className="h-full w-full rounded-2xl bg-white p-6 shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl">
                  <h2 className="text-lg font-semibold">{list.name}</h2>
                  <p>{list.description}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
};
