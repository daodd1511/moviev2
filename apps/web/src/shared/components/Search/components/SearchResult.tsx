import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

import { MovieSearch, TvSearch } from '@/models/search.model';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { PosterSizes, Type } from '@/shared/enums';
import { formatToYear } from '@/shared/utils';

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
    <Link
      to={`/${searchResult.mediaType}/${searchResult.id}`}
      className="group flex gap-4 border-b border-foreground/10 px-4 py-3.5 transition-colors outline-none last:border-b-0 hover:bg-foreground/[0.06] focus-visible:bg-foreground/[0.08] sm:px-5"
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
          <span className="ml-auto shrink-0 rounded-full border border-foreground/10 bg-foreground/[0.06] px-2 py-0.5 text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
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
  );
};

export const SearchResult = memo(SearchResultComponent);
