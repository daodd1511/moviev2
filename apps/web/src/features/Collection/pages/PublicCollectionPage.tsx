import { useState } from 'react';
import { useAtom } from 'jotai';
import { Film, Heart, LoaderCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader } from '@/shared/components';
import { NotFound } from '@/shared/components/NotFound';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { PosterSizes } from '@/shared/enums';
import { isAuthAtom } from '@/stores/atoms/authAtoms';
import { SocialQueries } from '@/stores/queries/socialQueries';

const LikeButton = ({ collectionId }: { readonly collectionId: string }) => {
  const [isAuthenticated] = useAtom(isAuthAtom);
  const { data: collection } = SocialQueries.useCollection(collectionId);
  const like = SocialQueries.useLike();
  const unlike = SocialQueries.useUnlike();

  if (!isAuthenticated || collection === undefined) return null;

  const isPending = like.isPending || unlike.isPending;
  const handleClick = () => {
    if (collection.isLikedByViewer) unlike.mutate(collectionId);
    else like.mutate(collectionId);
  };

  return (
    <Button
      type="button"
      variant={collection.isLikedByViewer ? 'outline' : 'default'}
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={collection.isLikedByViewer}
    >
      {isPending ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        <Heart aria-hidden="true" className="size-4" />
      )}
      <span>
        {collection.isLikedByViewer ? 'Liked' : 'Like'} · {collection.likeCount}
      </span>
    </Button>
  );
};

export const PublicCollectionPage = () => {
  const { collectionId = '' } = useParams<{ collectionId: string }>();
  const [filter, setFilter] = useState<'movie' | 'tv' | null>(null);
  const { data: collection, isPending, isError } = SocialQueries.useCollection(collectionId);

  if (isPending) return <Loader className="min-h-[60vh]" />;
  if (isError || collection === undefined) return <NotFound />;

  const items = collection.items;
  const movies = items.filter(item => item.mediaType === 'movie');
  const shows = items.filter(item => item.mediaType === 'tv');
  // Open on whichever kind the Collection actually holds until the viewer picks a tab.
  const activeFilter = filter ?? (movies.length === 0 && shows.length > 0 ? 'tv' : 'movie');

  const renderGrid = (entries: typeof items) => (
    <ol className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {entries.length === 0 ? (
        <li className="col-span-full rounded-xl border border-dashed border-foreground/15 py-14 text-center text-sm text-muted-foreground">
          No {activeFilter === 'movie' ? 'movies' : 'TV shows'} in this Collection.
        </li>
      ) : null}
      {entries.map(item => {
        const imageUrl =
          item.posterPath === null
            ? '/images/no-image.png'
            : `${IMAGE_BASE_URL}${PosterSizes.large}${item.posterPath}`;
        return (
          <li key={`${item.mediaType}:${item.tmdbId}`}>
            <Link to={`/${item.mediaType}/${item.tmdbId}`} className="group block">
              <div className="overflow-hidden rounded-md bg-surface shadow-[0_24px_48px_-12px_rgba(0,0,0,0.7)] outline outline-1 outline-foreground/15">
                <img
                  src={imageUrl}
                  alt={`${item.title} poster`}
                  loading="lazy"
                  className="aspect-[2/3] w-full object-cover transition-transform duration-300 ease-[cubic-bezier(.2,.9,.3,1)] motion-safe:group-hover:scale-105"
                />
              </div>
              <p className="mt-2 truncate text-sm font-medium transition-colors group-hover:text-primary">
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.mediaType === 'movie' ? 'Movie' : 'TV'}
              </p>
            </Link>
          </li>
        );
      })}
    </ol>
  );

  return (
    <main className="page-shell">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
            {collection.visibility === 'public' ? 'Public Collection' : 'Shared Collection'}
          </p>
          <h1 className="mt-2 text-3xl leading-tight font-light tracking-tight md:text-4xl">
            {collection.name}
          </h1>
          <Link
            to={`/u/${collection.ownerUsername}`}
            className="mt-2 inline-block text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            by @{collection.ownerUsername}
          </Link>
        </div>
        <LikeButton collectionId={collection.id} />
      </div>
      {collection.description !== null && (
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {collection.description}
        </p>
      )}
      {items.length === 0 ? (
        <div className="mt-10 flex min-h-72 items-center justify-center rounded-xl border border-dashed border-foreground/15 text-center text-muted-foreground">
          <div>
            <Film className="mx-auto size-8" aria-hidden="true" />
            <p className="mt-3 text-sm">This Collection has no titles yet.</p>
          </div>
        </div>
      ) : (
        <Tabs
          value={activeFilter}
          onValueChange={value => setFilter(value as 'movie' | 'tv')}
          className="mt-8"
        >
          <div className="border-b border-foreground/10 pb-2">
            <TabsList variant="line">
              <TabsTrigger value="movie">
                Movies
                <span className="text-muted-foreground tabular-nums">{movies.length}</span>
              </TabsTrigger>
              <TabsTrigger value="tv">
                TV
                <span className="text-muted-foreground tabular-nums">{shows.length}</span>
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="movie">{renderGrid(movies)}</TabsContent>
          <TabsContent value="tv">{renderGrid(shows)}</TabsContent>
        </Tabs>
      )}
    </main>
  );
};
