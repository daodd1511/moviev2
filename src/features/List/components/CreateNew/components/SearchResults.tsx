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

const SearchResultsComponent = ({
  searchResults,
  handleResultClick,
}: Props) => (
  <div className="h-80 overflow-auto rounded-md border border-gray-300 pt-2">
    {searchResults.length === 0 && (
      <p className="text-center">No data found</p>
    )}
    {searchResults.map(result => (
      <button
        key={result.id}
        className="flex w-full items-center border-b border-gray-200 p-4"
        onClick={() => handleResultClick(result)}
      >
        <img
          src={
              result.posterPath !== null ?
                `${IMAGE_BASE_URL}${PosterSizes.small}${result.posterPath}` :
                '/images/no-image.png'
          }
          alt="item poster"
          className="h-20 rounded-lg"
        />
        <div className="ml-4 mr-2">
          <h3 className="text-lg font-medium text-gray-900">
            {result instanceof Movie ? result.title : result.name}
          </h3>
        </div>
        <span
          className={`badge ${
              result instanceof Movie ?
                'badge-primary' :
                'badge-secondary'
          }`}
        >
          {result instanceof Movie ? Type.Movie : Type.Tv}
        </span>
      </button>
    ))}
  </div>
);

export const SearchResults = memo(SearchResultsComponent);
