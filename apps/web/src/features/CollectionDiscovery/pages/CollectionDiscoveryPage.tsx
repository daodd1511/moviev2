import { Link, useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { Compass, Heart, LoaderCircle } from 'lucide-react';

import { Loader } from '@/shared/components';
import { Button } from '@/components/ui/button';
import { SocialQueries } from '@/stores/queries/socialQueries';
import { isAuthAtom } from '@/stores/atoms/authAtoms';
import type { CollectionDiscoverySort, PublicCollectionSummary } from '@/models/social.model';

const DISCOVERY_LIMIT = 24;

const sortFromParams = (params: URLSearchParams): CollectionDiscoverySort =>
  params.get('sort') === 'popular' ? 'popular' : 'newest';

interface LikeButtonProps {
  readonly collection: PublicCollectionSummary;
}

const LikeButton = ({ collection }: LikeButtonProps) => {
  const [isAuthenticated] = useAtom(isAuthAtom);
  const like = SocialQueries.useLike();

  if (!isAuthenticated) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`Like ${collection.name}`}
      disabled={like.isPending}
      onClick={() => like.mutate(collection.id)}
    >
      {like.isPending ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        <Heart aria-hidden="true" className="size-4" />
      )}
    </Button>
  );
};

export const CollectionDiscoveryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = sortFromParams(searchParams);
  const {
    data: collections = [],
    isPending,
    isError,
  } = SocialQueries.useDiscovery({ sort, page: 1, limit: DISCOVERY_LIMIT });

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) =>
    setSearchParams(event.target.value === 'popular' ? { sort: 'popular' } : {});

  return (
    <main className="px-4 py-8 md:px-8 md:py-12">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Discover</p>
          <h1 className="mt-1 text-3xl font-semibold">Public Collections</h1>
          <p className="mt-2 text-muted-foreground">
            Browse Collections other Flix users have made public.
          </p>
        </div>
        <label className="grid gap-1.5 text-sm font-medium">
          Sort by
          <select
            value={sort}
            onChange={handleSortChange}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most liked</option>
          </select>
        </label>
      </header>

      {isPending ? (
        <Loader className="min-h-72" />
      ) : isError ? (
        <p role="alert" className="mt-8 text-destructive">
          Could not load public Collections. Please try again.
        </p>
      ) : collections.length === 0 ? (
        <div className="mt-8 grid min-h-72 place-items-center border-y border-border text-center">
          <div>
            <Compass className="mx-auto size-9 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-medium">No public Collections yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Make one of your Collections public to be the first here.
            </p>
          </div>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map(collection => (
            <li key={collection.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-2">
                <Link
                  to={`/u/${collection.ownerUsername}/collections/${collection.id}`}
                  className="min-w-0"
                >
                  <h2 className="truncate font-medium hover:underline">{collection.name}</h2>
                </Link>
                <LikeButton collection={collection} />
              </div>
              <p className="text-sm text-muted-foreground">by @{collection.ownerUsername}</p>
              {collection.description !== null && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {collection.description}
                </p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                {collection.itemCount} title{collection.itemCount === 1 ? '' : 's'} ·{' '}
                {collection.likeCount} like{collection.likeCount === 1 ? '' : 's'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};
