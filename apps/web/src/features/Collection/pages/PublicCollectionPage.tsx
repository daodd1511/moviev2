import { Film } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { Loader } from '@/shared/components';
import { NotFound } from '@/shared/components/NotFound';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { PosterSizes } from '@/shared/enums';
import { CollectionQueries } from '@/stores/queries/collectionQueries';

export const PublicCollectionPage = () => {
  const { username = '', collectionId = '' } = useParams<{
    username: string;
    collectionId: string;
  }>();
  const {
    data: collection,
    isPending,
    isError,
  } = CollectionQueries.usePublic(username, collectionId);

  if (isPending) return <Loader className="min-h-[60vh]" />;
  if (isError || collection === undefined) return <NotFound />;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
      <p className="text-sm font-medium text-primary">
        {collection.visibility === 'public' ? 'Public Collection' : 'Shared Collection'}
      </p>
      <h1 className="mt-1 text-2xl font-semibold md:text-3xl">{collection.name}</h1>
      {collection.description !== null && (
        <p className="mt-3 max-w-2xl text-muted-foreground">{collection.description}</p>
      )}
      {collection.items.length === 0 ? (
        <div className="mt-10 flex min-h-72 items-center justify-center border-y border-border text-center text-muted-foreground">
          <div>
            <Film className="mx-auto size-8 text-primary" aria-hidden="true" />
            <p className="mt-3">This Collection has no titles yet.</p>
          </div>
        </div>
      ) : (
        <ol className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {collection.items.map(item => {
            const imageUrl =
              item.posterPath === null
                ? '/images/no-image.png'
                : `${IMAGE_BASE_URL}${PosterSizes.large}${item.posterPath}`;
            return (
              <li key={`${item.mediaType}:${item.tmdbId}`}>
                <img
                  src={imageUrl}
                  alt={`${item.title} poster`}
                  className="aspect-[2/3] w-full rounded-md object-cover"
                  loading="lazy"
                />
                <p className="mt-2 truncate font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  {item.mediaType === 'movie' ? 'Movie' : 'TV'}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
};
