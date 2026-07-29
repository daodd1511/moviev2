import { memo } from 'react';

import { Movie, Tv } from '@/models/';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { PosterSizes, Type } from '@/shared/enums';

interface Props {
  /** Search result. */
  readonly searchResults: Array<Movie | Tv>;

  /** Search result click handle. */
  readonly handleResultClick: (media: Movie | Tv) => void;
}

const SearchResultsComponent = ({ searchResults, handleResultClick }: Props) => (
  <div className="h-80 overflow-auto rounded-md border border-border bg-popover pt-2">
    {searchResults.length === 0 && (
      <p className="text-center text-muted-foreground">No data found</p>
    )}
    {searchResults.map(result => (
      <button
        key={result.id}
        type="button"
        className="flex w-full items-center border-b border-border p-4 hover:bg-accent"
        onClick={() => handleResultClick(result)}
      >
        <img
          src={
            result.posterPath !== null
              ? `${IMAGE_BASE_URL}${PosterSizes.small}${result.posterPath}`
              : '/images/no-image.png'
          }
          alt="item poster"
          loading="lazy"
          className="h-20 rounded-md"
        />
        <div className="mr-2 ml-4">
          <h3 className="text-lg font-medium text-foreground">
            {result instanceof Movie ? result.title : result.name}
          </h3>
        </div>
        <span
          className={`ml-auto inline-block shrink-0 rounded-full px-2 py-0.5 text-xs ${
            result instanceof Movie
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          {result instanceof Movie ? Type.Movie : Type.Tv}
        </span>
      </button>
    ))}
  </div>
);

export const SearchResults = memo(SearchResultsComponent);
