import { FolderHeart, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Collaborators } from '../components/Collaborators';
import { CollectionPosterStrip } from '../components/CollectionPosterStrip';

import { Button } from '@/components/ui/button';
import { Loader } from '@/shared/components';
import type { Collection, CollectionVisibility } from '@/models/collection.model';
import { CollectionQueries } from '@/stores/queries/collectionQueries';

const VISIBILITY_LABEL: Record<CollectionVisibility, string> = {
  private: 'Private',
  unlisted: 'Unlisted',
  public: 'Public',
};

const countLabel = (count: number, noun: string): string =>
  `${count} ${noun}${count === 1 ? '' : 's'}`;

const CollectionTile = ({ collection }: { readonly collection: Collection }) => (
  <li>
    <Link
      to={`/collections/${collection.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-foreground/10 bg-surface/50 transition-colors duration-200 hover:border-foreground/25"
    >
      <div className="relative h-32 overflow-hidden">
        <CollectionPosterStrip
          items={collection.items}
          className="size-full transition-transform duration-300 ease-[cubic-bezier(.2,.9,.3,1)] motion-safe:group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/10" />
        <span className="absolute top-3 right-3 rounded-full border border-foreground/20 bg-background/70 px-2.5 py-0.5 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase backdrop-blur-sm">
          {VISIBILITY_LABEL[collection.visibility]}
        </span>
      </div>
      <div className="relative z-10 -mt-6 flex flex-1 flex-col gap-2 px-5 pb-5">
        <h2 className="truncate text-xl leading-tight font-medium tracking-tight">
          {collection.name}
        </h2>
        {collection.description !== null && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {collection.description}
          </p>
        )}
        <p className="mt-auto pt-2 text-xs tracking-[0.14em] text-muted-foreground uppercase">
          {countLabel(collection.items.length, 'title')} ·{' '}
          {countLabel(collection.likeCount, 'like')}
        </p>
      </div>
    </Link>
  </li>
);

export const CollectionListPage = () => {
  const { data: collections, isPending } = CollectionQueries.useAll();
  if (isPending) return <Loader className="min-h-[60vh]" />;
  return (
    <main className="page-shell">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Your library
          </p>
          <h1 className="mt-2 text-3xl leading-tight font-light tracking-tight md:text-4xl">
            Collections
          </h1>
        </div>
        <Button asChild>
          <Link to="/collections/new">
            <Plus aria-hidden="true" className="size-4" />
            New Collection
          </Link>
        </Button>
      </header>

      <Collaborators />

      {collections?.length === 0 ? (
        <div className="flex min-h-80 items-center justify-center rounded-xl border border-dashed border-foreground/15 text-center">
          <div className="px-6">
            <FolderHeart className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-medium">No Collections yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Create a Collection for movies and TV you want to keep together.
            </p>
            <Button asChild className="mt-6">
              <Link to="/collections/new">Create your first Collection</Link>
            </Button>
          </div>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {collections?.map(collection => (
            <CollectionTile key={collection.id} collection={collection} />
          ))}
        </ul>
      )}
    </main>
  );
};
