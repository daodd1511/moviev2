import { memo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Film } from 'lucide-react';

import { Media } from '@/models';
import { Loader, MediaListItem, Footer } from '@/shared/components';
import { NotFound } from '@/shared/components/NotFound';
import { Type } from '@/shared/enums';
import { assertNonNull } from '@/shared/utils';
import { ListQueries } from '@/stores/queries/listQueries';

const PublicListComponent = () => {
  const { username, listId } = useParams();
  const [selectedTab, setSelectedTab] = useState<Type | null>(null);
  assertNonNull(username);
  assertNonNull(listId);
  const { data, isPending, isError } = ListQueries.usePublicList(username, listId);

  if (isPending) {
    return <Loader className="min-h-[60vh]" />;
  }

  if (isError || data == null) {
    return <NotFound />;
  }

  const isListEmpty = data.movies.length === 0 && data.tvShows.length === 0;
  const activeTab =
    selectedTab ?? (data.movies.length > 0 || data.tvShows.length === 0 ? Type.Movie : Type.Tv);
  const activeItems = activeTab === Type.Movie ? data.movies : data.tvShows;
  const activeTypeLabel = activeTab === Type.Movie ? 'movies' : 'TV shows';

  return (
    <div className="px-4 py-8 md:px-8 md:py-12">
      <h1 className="text-2xl font-semibold text-foreground md:text-3xl">{data.name}</h1>
      {data.description !== '' && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
          {data.description}
        </p>
      )}
      <div className="mt-5 flex gap-2 overflow-x-auto border-b border-border pb-6 md:gap-4 md:pb-10">
        <button
          type="button"
          aria-pressed={activeTab === Type.Movie}
          className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm ${activeTab === Type.Movie ? 'bg-primary font-semibold text-primary-foreground' : 'text-muted-foreground'}`}
          onClick={() => setSelectedTab(Type.Movie)}
        >
          Movies <span className="ml-1 text-xs">({data.movies.length})</span>
        </button>
        <button
          type="button"
          aria-pressed={activeTab === Type.Tv}
          className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm ${activeTab === Type.Tv ? 'bg-primary font-semibold text-primary-foreground' : 'text-muted-foreground'}`}
          onClick={() => setSelectedTab(Type.Tv)}
        >
          TV Shows <span className="ml-1 text-xs">({data.tvShows.length})</span>
        </button>
      </div>

      {activeItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 pb-10 sm:grid-cols-autoFit sm:place-content-evenly sm:gap-x-6 sm:gap-y-10">
          {activeItems.map((media: Media) => (
            <div key={`${media.type}:${media.id}`}>
              <MediaListItem media={media} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[22rem] items-center justify-center border-b border-border">
          <div className="max-w-sm text-center">
            <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-border bg-surface text-primary">
              <Film className="size-6" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-medium text-foreground">
              {isListEmpty ? 'This list is empty' : `No ${activeTypeLabel} here`}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {isListEmpty
                ? 'Nothing has been added to this public list yet.'
                : `This public list does not contain any ${activeTypeLabel}.`}
            </p>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export const PublicList = memo(PublicListComponent);
