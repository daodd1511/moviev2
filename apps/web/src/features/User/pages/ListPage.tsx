import { Link } from 'react-router-dom';
import { ChevronRight, ListVideo } from 'lucide-react';

import { Loader } from '@/shared/components';
import { ListQueries } from '@/stores/queries/listQueries';
import { Button } from '@/components/ui/button';

export const ListPage = () => {
  const { data, isLoading } = ListQueries.useAll();

  if (isLoading) {
    return <Loader className="min-h-[60vh]"/>;
  }
  return (
    <div className="px-4 py-8 md:px-8 md:py-12">
      <div className="mb-7 flex items-center justify-between md:mb-8">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Your library
          </p>
          <h1 className="text-2xl font-semibold md:text-3xl">My lists</h1>
        </div>
        <Button asChild className="h-10 rounded-full px-4">
          <Link to="/list/new">New list</Link>
        </Button>
      </div>

      {data?.length === 0 && (
        <div className="flex min-h-[20rem] items-center justify-center border-y border-border">
          <div className="max-w-xs text-center">
            <ListVideo className="mx-auto size-8 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-medium text-foreground">No lists yet</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Create a list to start collecting movies and TV shows.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data?.map(list => {
          const itemCount = list.movies.length + list.tvShows.length;

          return (
            <Link
              key={list.id}
              to={`/list/${list.id}`}
              className="group flex min-h-32 items-center rounded-lg border border-border bg-card/70 p-5 transition-colors hover:border-foreground/20 hover:bg-card"
            >
              <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-foreground">{list.name}</h2>
                {list.description !== '' && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {list.description}
                  </p>
                )}
                <p className="mt-3 text-xs font-medium text-primary">
                  {itemCount} title{itemCount === 1 ? '' : 's'}
                </p>
              </div>
              <ChevronRight
                className="ml-3 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
};
