import { ChevronRight, FolderHeart } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Collaborators } from '../components/Collaborators';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader } from '@/shared/components';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { PosterSizes } from '@/shared/enums';
import type { Collection, CollectionItem, CollectionVisibility } from '@/models/collection.model';
import { CollectionQueries } from '@/stores/queries/collectionQueries';

const itemKey = (item: { readonly mediaType: string; readonly tmdbId: number }): string =>
  `${item.mediaType}:${item.tmdbId}`;

const posterUrl = (item: CollectionItem): string | null =>
  item.posterPath === null ? null : `${IMAGE_BASE_URL}${PosterSizes.small}${item.posterPath}`;

const VISIBILITY_LABEL: Record<CollectionVisibility, string> = {
  private: 'Private',
  unlisted: 'Unlisted',
  public: 'Public',
};

const VISIBILITY_VARIANT: Record<CollectionVisibility, 'outline' | 'secondary' | 'default'> = {
  private: 'outline',
  unlisted: 'secondary',
  public: 'default',
};

const CoverArt = ({ collection }: { readonly collection: Collection }) => {
  const coverItem =
    collection.cover === null
      ? undefined
      : collection.items.find(item => itemKey(item) === itemKey(collection.cover!));

  if (coverItem !== undefined) {
    const url = posterUrl(coverItem);
    if (url !== null) return <img src={url} alt="" className="size-full object-cover" />;
  }

  if (collection.items.length >= 4) {
    return (
      <div className="grid size-full grid-cols-2 gap-px">
        {collection.items.slice(0, 4).map(item => {
          const url = posterUrl(item);
          return url === null ? (
            <div key={itemKey(item)} className="bg-surface" />
          ) : (
            <img key={itemKey(item)} src={url} alt="" className="size-full object-cover" />
          );
        })}
      </div>
    );
  }

  const firstItem = collection.items[0];
  const firstUrl = firstItem === undefined ? null : posterUrl(firstItem);
  if (firstUrl !== null) return <img src={firstUrl} alt="" className="size-full object-cover" />;

  return (
    <div className="flex size-full items-center justify-center bg-surface">
      <FolderHeart className="size-6 text-muted-foreground" aria-hidden="true" />
    </div>
  );
};

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
      <Collaborators />
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
              className="group flex items-center gap-4 rounded-lg border border-border bg-card/70 p-4 hover:border-foreground/20 hover:bg-card"
            >
              <div className="size-20 shrink-0 overflow-hidden rounded-md bg-surface">
                <CoverArt collection={collection} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-lg font-semibold">{collection.name}</h2>
                  <Badge variant={VISIBILITY_VARIANT[collection.visibility]}>
                    {VISIBILITY_LABEL[collection.visibility]}
                  </Badge>
                </div>
                {collection.description !== null && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {collection.description}
                  </p>
                )}
                <p className="mt-3 text-xs font-medium text-primary">
                  {collection.items.length} title{collection.items.length === 1 ? '' : 's'} ·{' '}
                  {collection.likeCount} like{collection.likeCount === 1 ? '' : 's'}
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
