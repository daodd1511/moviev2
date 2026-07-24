import { ChangeEvent, memo, useRef, useState } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';

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
          className={`block h-10 w-full rounded-md border border-input bg-white/[0.08] text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ${
            isSearchBarOpen ? 'px-3' : 'px-0'
          }`}
          placeholder="Search Movies, TVs"
          required
          onChange={onSearchChange}
        />
        {searchQuery !== '' && (
          <div className="absolute top-12 right-0 z-20 h-80 w-[280px] overflow-auto overflow-x-hidden rounded-md border border-border bg-popover shadow-xl md:w-[400px]">
            {isLoading && <Loader />}
            {isError && <div className="p-4 text-sm text-destructive">Error: {error.message}</div>}
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
        aria-label={isSearchBarOpen ? 'Close search' : 'Open search'}
        className="flex h-12 w-12 items-center justify-center text-foreground"
        onClick={onSearchButtonClick}
      >
        {isSearchBarOpen ?
          (
            <X className="h-5 w-5" />
          ) :
          (
            <SearchIcon className="h-5 w-5" />
          )}
      </button>
    </div>
  );
};

export const Search = memo(SearchComponent);
