import { ChevronRight, FolderHeart } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Loader } from '@/shared/components';
import { CollectionQueries } from '@/stores/queries/collectionQueries';

export const CollectionListPage = () => {
  const { data: collections, isPending } = CollectionQueries.useAll();
  if (isPending) return <Loader className="min-h-[60vh]" />;
  return (
    <main className="px-4 py-8 md:px-8 md:py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            Your library
          </p>
          <h1 className="text-2xl font-semibold md:text-3xl">My Collections</h1>
        </div>
        <Button asChild>
          <Link to="/collections/new">New Collection</Link>
        </Button>
      </div>
      {collections?.length === 0 ? (
        <div className="flex min-h-80 items-center justify-center border-y border-border text-center">
          <div>
            <FolderHeart className="mx-auto size-8 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-medium">No Collections yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a Collection for movies and TV you want to keep together.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collections?.map(collection => (
            <Link
              key={collection.id}
              to={`/collections/${collection.id}`}
              className="group flex min-h-32 items-center rounded-lg border border-border bg-card/70 p-5 hover:border-foreground/20 hover:bg-card"
            >
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-semibold">{collection.name}</h2>
                {collection.description !== null && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {collection.description}
                  </p>
                )}
                <p className="mt-3 text-xs font-medium text-primary">
                  {collection.items.length} title{collection.items.length === 1 ? '' : 's'} ·{' '}
                  {collection.visibility}
                </p>
              </div>
              <ChevronRight
                className="ml-3 size-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
};
