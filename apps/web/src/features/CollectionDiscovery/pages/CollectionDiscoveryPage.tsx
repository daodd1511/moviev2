import { useId } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { Compass, Heart, LoaderCircle } from 'lucide-react';

import { Loader } from '@/shared/components';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInfiniteScroll } from '@/shared/hooks';
import { SocialQueries } from '@/stores/queries/socialQueries';
import { isAuthAtom } from '@/stores/atoms/authAtoms';
import type { CollectionDiscoverySort, PublicCollectionSummary } from '@/models/social.model';

const DISCOVERY_LIMIT = 24;

const sortFromParams = (params: URLSearchParams): CollectionDiscoverySort =>
  params.get('sort') === 'popular' ? 'popular' : 'newest';

const countLabel = (count: number, noun: string): string =>
  `${count} ${noun}${count === 1 ? '' : 's'}`;

interface LikeButtonProps {
  readonly collection: PublicCollectionSummary;
}

const LikeButton = ({ collection }: LikeButtonProps) => {
  const [isAuthenticated] = useAtom(isAuthAtom);
  const like = SocialQueries.useLike();

  if (!isAuthenticated) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
        <Heart aria-hidden="true" className="size-3.5" />
        {collection.likeCount}
      </span>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="relative z-10 -mr-2 gap-1.5 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary"
      aria-label={`Like ${collection.name}`}
      disabled={like.isPending}
      onClick={() => like.mutate(collection.id)}
    >
      {like.isPending ? (
        <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
      ) : (
        <Heart aria-hidden="true" className="size-3.5" />
      )}
      <span className="tabular-nums">{collection.likeCount}</span>
    </Button>
  );
};

/**
 * Discovery cards are typographic rather than poster-led: the summary the API returns
 * carries only a cover *key*, with no poster path to render from.
 */
const DiscoveryCard = ({ collection }: { readonly collection: PublicCollectionSummary }) => (
  <li>
    <article className="group relative flex h-full flex-col rounded-xl border border-foreground/10 bg-surface/40 p-5 transition-colors duration-200 focus-within:border-foreground/25 hover:border-foreground/25">
      <span
        aria-hidden="true"
        className="absolute top-4 right-5 text-4xl leading-none font-light text-foreground/10 tabular-nums transition-colors duration-200 group-hover:text-primary/35"
      >
        {collection.itemCount}
      </span>

      <h2 className="pr-14 text-xl leading-tight font-medium tracking-tight">
        <Link
          to={`/u/${collection.ownerUsername}/collections/${collection.id}`}
          className="outline-none after:absolute after:inset-0 after:rounded-xl group-focus-within:after:ring-3 group-focus-within:after:ring-ring/50"
        >
          {collection.name}
        </Link>
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">by @{collection.ownerUsername}</p>

      {collection.description !== null && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {collection.description}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-foreground/10 pt-4 text-xs tracking-[0.14em] text-muted-foreground uppercase">
        <span>{countLabel(collection.itemCount, 'title')}</span>
        <LikeButton collection={collection} />
      </div>
    </article>
  </li>
);

export const CollectionDiscoveryPage = () => {
  const sortId = useId();
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = sortFromParams(searchParams);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError } =
    SocialQueries.useInfiniteDiscovery({ sort, limit: DISCOVERY_LIMIT });
  const collections = data?.pages.flat() ?? [];
  const { observerElement } = useInfiniteScroll(
    { root: null, rootMargin: '0px', threshold: 0.5 },
    () => void fetchNextPage(),
    hasNextPage,
  );

  const handleSortChange = (value: string) =>
    setSearchParams(value === 'popular' ? { sort: 'popular' } : {});

  return (
    <main className="page-shell">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground/10 pb-6">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Discover
          </p>
          <h1 className="mt-2 text-3xl leading-tight font-light tracking-tight md:text-4xl">
            Public Collections
          </h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
            Browse Collections other Flix users have made public.
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor={sortId}>Sort by</Label>
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger id={sortId} className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most liked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {isPending ? (
        <Loader className="min-h-72" />
      ) : isError ? (
        <p
          role="alert"
          className="mt-8 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive"
        >
          Could not load public Collections. Please try again.
        </p>
      ) : collections.length === 0 ? (
        <div className="mt-8 grid min-h-72 place-items-center rounded-xl border border-dashed border-foreground/15 text-center">
          <div className="px-6">
            <Compass className="mx-auto size-9 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-medium">No public Collections yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Make one of your Collections public to be the first here.
            </p>
          </div>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map(collection => (
            <DiscoveryCard key={collection.id} collection={collection} />
          ))}
        </ul>
      )}
      <div ref={observerElement}>{hasNextPage === true && isFetchingNextPage && <Loader />}</div>
    </main>
  );
};
