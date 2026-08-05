import { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

import { AddTitlesDialog } from './AddTitlesDialog';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  Collection,
  CollectionItem,
  CollectionItemKey,
  CollectionMediaType,
} from '@/models/collection.model';
import { getApiErrorMessage } from '@/api/utils/getApiErrorMessage';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { PosterSizes } from '@/shared/enums';
import { CollectionQueries } from '@/stores/queries/collectionQueries';

interface CollectionItemsProps {
  readonly collection: Collection;
}

/** A title paired with its position in the full Collection, so numbering survives filtering. */
interface PositionedItem {
  readonly item: CollectionItem;
  readonly position: number;
}

const itemKey = (item: CollectionItemKey): string => `${item.mediaType}:${item.tmdbId}`;

const posterUrl = (posterPath: string | null, size: PosterSizes): string =>
  posterPath === null ? '/images/no-image.png' : `${IMAGE_BASE_URL}${size}${posterPath}`;

export const CollectionItems = ({ collection }: CollectionItemsProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<CollectionItem | null>(null);
  const addItem = CollectionQueries.useAddItem();
  const removeItem = CollectionQueries.useRemoveItem();
  const reorder = CollectionQueries.useReorder();
  const update = CollectionQueries.useUpdate();

  const positioned: readonly PositionedItem[] = collection.items.map((item, position) => ({
    item,
    position,
  }));
  const movies = positioned.filter(entry => entry.item.mediaType === 'movie');
  const shows = positioned.filter(entry => entry.item.mediaType === 'tv');
  // Open on whichever kind the Collection actually holds, so a movies-only Collection
  // never lands on an empty TV tab.
  const [filter, setFilter] = useState<CollectionMediaType>(
    shows.length > 0 && movies.length === 0 ? 'tv' : 'movie',
  );
  const visible = filter === 'movie' ? movies : shows;
  const existingKeys = new Set(collection.items.map(itemKey));

  const handleAdd = (item: CollectionItem): void => {
    addItem.mutate(
      { id: collection.id, version: collection.version, item },
      {
        onSuccess: () => toast.success(`Added “${item.title}” to the Collection.`),
        onError: error => toast.error(getApiErrorMessage(error, 'Could not add this title.')),
      },
    );
  };

  const handleRemove = (): void => {
    if (pendingRemoval === null) return;
    const item = pendingRemoval;
    removeItem.mutate(
      { id: collection.id, version: collection.version, item },
      {
        onSuccess: () => {
          setPendingRemoval(null);
          toast.success(`Removed “${item.title}”.`);
        },
        onError: error => toast.error(getApiErrorMessage(error, 'Could not remove this title.')),
      },
    );
  };

  /**
   * Swaps a title with its neighbour *within the active tab*, so reordering in Movies or
   * TV never shuffles titles the user cannot see.
   */
  const handleMove = (item: CollectionItem, direction: -1 | 1): void => {
    const fromIndex = visible.findIndex(entry => itemKey(entry.item) === itemKey(item));
    const source = visible[fromIndex];
    const target = visible[fromIndex + direction];
    if (source === undefined || target === undefined) return;
    const nextItems = [...collection.items];
    nextItems[source.position] = target.item;
    nextItems[target.position] = source.item;
    reorder.mutate(
      {
        id: collection.id,
        version: collection.version,
        items: nextItems.map(({ mediaType, tmdbId }) => ({ mediaType, tmdbId })),
      },
      {
        onError: error =>
          toast.error(getApiErrorMessage(error, 'Could not reorder the Collection.')),
      },
    );
  };

  const handleCover = (item: CollectionItem): void => {
    update.mutate(
      {
        id: collection.id,
        version: collection.version,
        cover: { mediaType: item.mediaType, tmdbId: item.tmdbId },
      },
      {
        onSuccess: () => toast.success(`Set “${item.title}” as the cover.`),
        onError: error => toast.error(getApiErrorMessage(error, 'Could not update the cover.')),
      },
    );
  };

  const renderGrid = (entries: readonly PositionedItem[]) => {
    if (entries.length === 0) {
      return (
        <p className="mt-6 rounded-xl border border-dashed border-foreground/15 py-14 text-center text-sm text-muted-foreground">
          {collection.items.length === 0
            ? 'No titles in this Collection yet.'
            : `No ${filter === 'movie' ? 'movies' : 'TV shows'} in this Collection yet.`}
        </p>
      );
    }

    return (
      <ol className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {entries.map(({ item, position }, index) => {
          const isCover = collection.cover !== null && itemKey(collection.cover) === itemKey(item);
          return (
            <li key={itemKey(item)} className="group">
              <div className="relative overflow-hidden rounded-md bg-surface shadow-[0_24px_48px_-12px_rgba(0,0,0,0.7)] outline outline-1 outline-foreground/15">
                <img
                  src={posterUrl(item.posterPath, PosterSizes.large)}
                  alt=""
                  loading="lazy"
                  className="aspect-[2/3] size-full object-cover"
                />
                <span className="absolute top-2 left-2 rounded-full bg-background/80 px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums backdrop-blur-sm">
                  {position + 1}
                </span>
                {isCover && (
                  <span className="absolute top-2 right-2 rounded-full border border-primary/30 bg-background/80 px-2 py-0.5 text-xs font-medium tracking-[0.14em] text-primary uppercase backdrop-blur-sm">
                    Cover
                  </span>
                )}
                <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-background via-background/60 to-transparent p-2 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100">
                  <div className="flex flex-wrap items-center justify-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="rounded-full bg-background/70 hover:bg-background"
                      aria-label={`Move ${item.title} earlier`}
                      disabled={index === 0 || reorder.isPending}
                      onClick={() => handleMove(item, -1)}
                    >
                      <ChevronLeft aria-hidden="true" className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="rounded-full bg-background/70 hover:bg-background"
                      aria-label={`Move ${item.title} later`}
                      disabled={index === entries.length - 1 || reorder.isPending}
                      onClick={() => handleMove(item, 1)}
                    >
                      <ChevronRight aria-hidden="true" className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="rounded-full bg-background/70 hover:bg-background"
                      aria-label={
                        isCover ? `${item.title} is the cover` : `Set ${item.title} as cover`
                      }
                      disabled={isCover || update.isPending}
                      onClick={() => handleCover(item)}
                    >
                      <ImageIcon aria-hidden="true" className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="rounded-full bg-background/70 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                      aria-label={`Remove ${item.title}`}
                      disabled={removeItem.isPending}
                      onClick={() => setPendingRemoval(item)}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <p className="mt-2 truncate text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {item.mediaType === 'movie' ? 'Movie' : 'TV'} · {item.releaseDate.slice(0, 4)}
              </p>
            </li>
          );
        })}
      </ol>
    );
  };

  return (
    <section aria-labelledby="collection-items-heading" className="mt-12">
      <h2 id="collection-items-heading" className="sr-only">
        Titles
      </h2>
      <Tabs
        value={filter}
        onValueChange={value => setFilter(value as CollectionMediaType)}
        className="mt-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/10 pb-2">
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
          <Button type="button" size="sm" variant="outline" onClick={() => setIsAdding(true)}>
            <Plus aria-hidden="true" className="size-4" /> Add titles
          </Button>
        </div>
        <TabsContent value="movie">{renderGrid(movies)}</TabsContent>
        <TabsContent value="tv">{renderGrid(shows)}</TabsContent>
      </Tabs>

      <ConfirmDialog
        open={pendingRemoval !== null}
        onOpenChange={open => !open && setPendingRemoval(null)}
        icon={<Trash2 aria-hidden="true" className="size-5" />}
        title={`Remove “${pendingRemoval?.title ?? ''}”?`}
        description="This takes the title out of this Collection. It stays in your Library and any other Collection."
        confirmLabel="Remove title"
        destructive
        isLoading={removeItem.isPending}
        onConfirm={handleRemove}
      />

      <AddTitlesDialog
        open={isAdding}
        onOpenChange={setIsAdding}
        existingKeys={existingKeys}
        onAdd={handleAdd}
        isAdding={addItem.isPending}
      />
    </section>
  );
};
