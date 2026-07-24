import { Link } from 'react-router-dom';

import { Loader } from '@/shared/components';
import { ListQueries } from '@/stores/queries/listQueries';
import { Button } from '@/components/ui/button';

export const ListPage = () => {
  const { data, isLoading } = ListQueries.useAll();

  if (isLoading) {
    return <Loader className="min-h-[60vh]"/>;
  }
  return (
    <div className="px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1>My list</h1>
        <Button asChild size="sm">
          <Link to="/list/new">Create</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data?.map(list => (
          <Link key={list.id} to={`/list/${list.id}`}>
            <div className="h-full w-full rounded-md border border-border bg-card p-6 shadow-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl">
              <h2 className="text-lg font-semibold text-foreground">{list.name}</h2>
              <p className="text-muted-foreground">{list.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
