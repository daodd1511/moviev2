import { memo } from 'react';

import { Link } from 'react-router-dom';

import { MovieSearch, TvSearch } from '@/models/search.model';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { PosterSizes, Type } from '@/shared/enums';

interface Props {

  /** Search result. */
  readonly searchResult: MovieSearch | TvSearch;

  /** Reset searching state. */
  readonly resetSearchState: () => void;
}

const SearchResultComponent = ({ searchResult, resetSearchState }: Props) => {
  const onSearchResultClick = () => {
    resetSearchState();
  };
  return (
    <Link
      to={`/${searchResult.mediaType}/${searchResult.id}`}
      key={searchResult.id}
      className="flex items-center border-b border-border p-4 hover:bg-accent"
      onClick={onSearchResultClick}
    >
      <img
        src={
          searchResult.posterPath !== null ?
            `${IMAGE_BASE_URL}${PosterSizes.small}${searchResult.posterPath}` :
            '/images/no-image.png'
        }
        alt="item poster"
        className="h-20 rounded-md"
        loading="lazy"
      />
      <div className="ml-4 mr-2">
        <h3 className="text-base font-medium text-foreground">
          {searchResult instanceof MovieSearch ? searchResult.title : searchResult.name}
        </h3>
      </div>
      <span className={`ml-auto inline-block shrink-0 rounded-full px-2 py-0.5 text-xs ${searchResult.mediaType === Type.Movie ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
        {searchResult.mediaType}
      </span>
    </Link>
  );
};

export const SearchResult = memo(SearchResultComponent);
