import { ChangeEvent, memo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';

import { SearchResult } from './components/SearchResult';

import { Loader } from '@/shared/components';
import { useDebounce } from '@/shared/hooks';
import { SearchQueries } from '@/stores/queries/searchQueries';

const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceSearchQuery = useDebounce<string>(searchQuery);
  const { data, isLoading, isError, error } = SearchQueries.useMulti(debounceSearchQuery);

  const onSearchButtonClick = () => {
    setIsSearchBarOpen(!isSearchBarOpen);
    resetSearchState();
    if (searchInputRef.current != null) {
      searchInputRef.current.focus();
    }
  };

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const resetSearchState = () => {
    setSearchQuery('');
  };
  return (
    <div className="flex">
      <div
        className={`relative transition-all ${
          isSearchBarOpen ? 'w-[220px] md:w-[400px]' : 'w-0'
        }`}
      >
        <input
          ref={searchInputRef}
          type="search"
          value={searchQuery}
          className={`block h-10 w-full rounded-lg bg-gray-50 text-gray-900 outline-none ${
            isSearchBarOpen ? 'px-3' : 'px-0'
          }`}
          placeholder="Search Movies, TVs"
          required
          onChange={onSearchChange}
        />
        {searchQuery !== '' && (
          <div className="absolute top-16 z-20 h-80 w-full overflow-auto overflow-x-hidden rounded-lg bg-white shadow-xl">
            {isLoading && <Loader />}
            {isError && <div>Error: {error.message}</div>}
            {data?.map(result => (
              <SearchResult
                key={result.id}
                searchResult={result}
                resetSearchState={resetSearchState}
              />
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        className="px-3 text-xl"
        onClick={onSearchButtonClick}
      >
        {isSearchBarOpen ?
          (
            <FontAwesomeIcon icon={faXmark} />
          ) :
          (
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          )}
      </button>
    </div>
  );
};

export const Search = memo(SearchComponent);
