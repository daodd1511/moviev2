import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

import { Media } from '@/models';
import { MovieSearch, TvSearch } from '@/models/search.model';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { PosterSizes, Type } from '@/shared/enums';
import { formatToYear } from '@/shared/utils';
import { LibraryAction } from '@/shared/components/LibraryAction';

interface Props {
  /** Search result. */
  readonly searchResult: MovieSearch | TvSearch;

  /** Result selection handler. */
  readonly onSelect: () => void;
}

const SearchResultComponent = ({ searchResult, onSelect }: Props) => {
  const isMovie = searchResult instanceof MovieSearch;
  const title = isMovie ? searchResult.title : searchResult.name;
  const releaseDate = isMovie ? searchResult.releaseDate : searchResult.firstAirDate;

  return (
    <div className="group relative border-b border-foreground/10 last:border-b-0">
      <Link
        to={`/${searchResult.mediaType}/${searchResult.id}`}
        className="flex gap-4 px-4 py-3.5 pr-14 transition-colors outline-none hover:bg-foreground/[0.16] focus-visible:bg-foreground/[0.16] sm:px-5 sm:pr-16"
        onClick={onSelect}
      >
        <img
          src={
            searchResult.posterPath !== null
              ? `${IMAGE_BASE_URL}${PosterSizes.small}${searchResult.posterPath}`
              : '/images/no-image.png'
          }
          alt={`${title} poster`}
          className="aspect-2/3 h-24 shrink-0 rounded-md object-cover outline outline-1 outline-foreground/10"
          loading="lazy"
        />
        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex items-start gap-3">
            <h3 className="truncate text-base font-medium text-foreground">{title}</h3>
            <span className="ml-auto shrink-0 rounded-full border border-foreground/10 bg-foreground/[0.08] px-2 py-0.5 text-micro font-medium tracking-wide text-muted-foreground uppercase">
              {searchResult.mediaType === Type.Movie ? 'Movie' : 'TV'}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatToYear(releaseDate)}</span>
            {searchResult.voteAverage > 0 && (
              <span className="inline-flex items-center gap-1 text-primary">
                <Star aria-hidden="true" className="size-3 fill-current" />
                {searchResult.voteAverage.toFixed(1)}
              </span>
            )}
          </p>
          {searchResult.overview !== '' && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {searchResult.overview}
            </p>
          )}
        </div>
      </Link>
      <LibraryAction
        media={
          new Media({
            id: searchResult.id,
            posterPath: searchResult.posterPath,
            releaseDate,
            title,
            voteAverage: searchResult.voteAverage,
            type: searchResult.mediaType,
          })
        }
        iconOnly
        className="absolute top-4 right-4 h-8 w-8 sm:right-5"
      />
    </div>
  );
};

export const SearchResult = memo(SearchResultComponent);
