import { ChangeEvent, memo, useEffect, useState } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';

import { SearchResult } from './components/SearchResult';

import { Loader } from '@/shared/components';
import { useDebounce } from '@/shared/hooks';
import { SearchQueries } from '@/stores/queries/searchQueries';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

const MINIMUM_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const normalizedQuery = searchQuery.trim();
  const debouncedQuery = useDebounce(normalizedQuery, SEARCH_DEBOUNCE_MS);
  const { data, isLoading, isError, error } = SearchQueries.useMulti(debouncedQuery);

  const isDebouncing = normalizedQuery !== debouncedQuery;
  const canSearch = normalizedQuery.length >= MINIMUM_QUERY_LENGTH;
  const isSearching = canSearch && (isDebouncing || isLoading);
  const results = !isDebouncing ? data : undefined;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery('');
    }
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleResultSelect = () => {
    handleOpenChange(false);
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <button
        type="button"
        aria-label="Search movies and TV shows"
        className="group flex h-10 items-center gap-2 rounded-full px-2.5 text-muted-foreground transition-colors hover:bg-foreground/[0.08] hover:text-foreground md:px-3"
        onClick={() => setIsOpen(true)}
      >
        <SearchIcon aria-hidden="true" className="size-5" />
        <span className="hidden text-sm lg:inline">Search</span>
        <kbd className="ml-1 hidden rounded-md border border-foreground/10 bg-foreground/[0.06] px-1.5 py-0.5 text-[0.65rem] font-medium text-muted-foreground xl:inline">
          ⌘K
        </kbd>
      </button>

      <DialogContent
        showCloseButton={false}
        className="top-[10svh] w-[min(94vw,48rem)] max-w-none -translate-y-0 gap-0 overflow-hidden border border-foreground/10 bg-popover/98 p-0 shadow-[0_32px_90px_-24px_rgba(0,0,0,0.9)] sm:max-w-none"
      >
        <DialogTitle className="sr-only">Search movies and TV shows</DialogTitle>

        <div className="flex h-16 items-center gap-3 border-b border-foreground/10 px-4 sm:px-5">
          <SearchIcon aria-hidden="true" className="size-5 shrink-0 text-primary" />
          <input
            autoFocus
            type="search"
            value={searchQuery}
            placeholder="Search movies and TV shows…"
            aria-label="Search movies and TV shows"
            className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-lg"
            onChange={handleSearchChange}
          />
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Close search"
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.08] hover:text-foreground"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </DialogClose>
        </div>

        <div className="max-h-[70svh] min-h-40 overflow-y-auto">
          {!canSearch && (
            <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center">
              <p className="text-sm font-medium text-foreground">Find your next watch</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter at least {MINIMUM_QUERY_LENGTH} characters to search.
              </p>
            </div>
          )}

          {isSearching && <Loader className="min-h-48" />}

          {canSearch && !isSearching && isError && (
            <div className="flex min-h-40 items-center justify-center p-6 text-sm text-destructive">
              Search failed: {error.message}
            </div>
          )}

          {canSearch && !isSearching && !isError && results?.length === 0 && (
            <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center">
              <p className="text-sm font-medium text-foreground">No titles found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different title or spelling.
              </p>
            </div>
          )}

          {canSearch && !isSearching && !isError && results !== undefined && results.length > 0 && (
            <div aria-live="polite">
              <p className="border-b border-foreground/10 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {results.length} result{results.length === 1 ? '' : 's'}
              </p>
              <div>
                {results.map(result => (
                  <SearchResult
                    key={`${result.mediaType}-${result.id}`}
                    searchResult={result}
                    onSelect={handleResultSelect}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const Search = memo(SearchComponent);
