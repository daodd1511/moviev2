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
      to={`/${searchResult.mediaType}/detail/${searchResult.id}`}
      key={searchResult.id}
      className="flex items-center border-b border-gray-200 p-4"
      onClick={onSearchResultClick}
    >
      <img
        src={
          searchResult.posterPath !== null ?
            `${IMAGE_BASE_URL}${PosterSizes.small}${searchResult.posterPath}` :
            '/images/no-image.png'
        }
        alt="item poster"
        className="h-20 rounded-lg"
      />
      <div className="ml-4 mr-2">
        <h3 className="text-lg font-medium text-gray-900">
          {searchResult instanceof MovieSearch ? searchResult.title : searchResult.name}
        </h3>
      </div>
      <span className={`badge ${searchResult.mediaType === Type.Movie ? 'badge-primary' : 'badge-accent'}`}>
        {searchResult.mediaType}
      </span>
    </Link>
  );
};

export const SearchResult = memo(SearchResultComponent);
