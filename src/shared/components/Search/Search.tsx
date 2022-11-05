import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ChangeEvent, memo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';

import { SearchResult } from './components/SearchResult';

import { Spinner } from '@/shared/components';
import { useDebounce } from '@/shared/hooks';
import { MovieSearch, TvSearch } from '@/models/search.model';
import { SearchService } from '@/api/services/searchService';

const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceSearchQuery = useDebounce<string>(searchQuery);
  const { data, isLoading, isError, error } = useQuery<
    Array<MovieSearch | TvSearch>,
    AxiosError
  >(
    ['search', debounceSearchQuery],
    () => SearchService.multi(debounceSearchQuery),
    {
      enabled: debounceSearchQuery !== '',
    },
  );

  const onSearchButtonClick = () => {
    setIsSearchBarOpen(!isSearchBarOpen);
    setSearchQuery('');
    if (searchInputRef.current != null) {
      searchInputRef.current.focus();
    }
  };

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsSearching(true);
  };
  return (
    <div className="flex">
      <div
        className={`relative transition-all ${
          isSearchBarOpen ? 'w-[700px]' : 'w-0'
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
        {isSearching && searchQuery !== '' && (
          <div className="absolute top-16 z-20 h-80 w-full overflow-auto overflow-x-hidden rounded-lg bg-white shadow-xl">
            {isLoading && <Spinner />}
            {isError && <div>Error: {error.message}</div>}
            {data?.map(result => (
              <SearchResult
                key={result.id}
                searchResult={result}
                setIsSearching={setIsSearching}
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
