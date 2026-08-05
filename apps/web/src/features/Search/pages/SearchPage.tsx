import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CatalogQueries } from '@/stores/queries/catalogQueries';
import type { CatalogSearchType } from '@/models/catalog-query.model';
import { Loader } from '@/shared/components';
import { useInfiniteScroll } from '@/shared/hooks';

const validType = (value: string | null): CatalogSearchType =>
  value === 'movie' || value === 'tv' || value === 'person' ? value : 'multi';
export const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const query = params.get('q')?.trim() ?? '';
  const type = validType(params.get('type'));
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('catalog-recent-searches') ?? '[]') as string[];
    } catch {
      return [];
    }
  });
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError, refetch } =
    CatalogQueries.useInfiniteSearch(query, type);
  const { observerElement } = useInfiniteScroll(
    { root: null, rootMargin: '0px', threshold: 0.5 },
    () => void fetchNextPage(),
    hasNextPage,
  );
  const setParam = (next: Record<string, string>) => setParams({ q: query, type, ...next });
  useEffect(() => {
    if (query === '') return;
    setRecent(current => {
      const next = [query, ...current.filter(item => item !== query)].slice(0, 8);
      localStorage.setItem('catalog-recent-searches', JSON.stringify(next));
      return next;
    });
  }, [query]);
  const clearRecent = () => {
    setRecent([]);
    localStorage.removeItem('catalog-recent-searches');
  };
  if (query === '')
    return (
      <main className="page-shell">
        <h1 className="text-2xl font-semibold">Search</h1>
        <p className="mt-3 text-muted-foreground">
          Search for movies, TV, and people from the quick search dialog.
        </p>
        {recent.length > 0 && (
          <section className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Recent searches</h2>
              <button type="button" onClick={clearRecent}>
                Clear recent searches
              </button>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {recent.map(item => (
                <li key={item}>
                  <Link
                    className="rounded-full border px-3 py-1"
                    to={`/search?q=${encodeURIComponent(item)}`}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    );
  const results = data?.pages.flatMap(page => page.results) ?? [];
  return (
    <main className="page-shell">
      <h1 className="text-2xl font-semibold">Search results for “{query}”</h1>
      <div className="mt-5 flex gap-2" role="tablist" aria-label="Search result type">
        {(['multi', 'movie', 'tv', 'person'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={type === tab}
            className="rounded-full px-3 py-1 text-sm"
            onClick={() => setParam({ type: tab })}
          >
            {tab === 'multi'
              ? 'All'
              : tab === 'tv'
                ? 'TV'
                : `${tab[0].toUpperCase()}${tab.slice(1)}`}
          </button>
        ))}
      </div>
      {isPending && (
        <p className="mt-8" aria-live="polite">
          Searching…
        </p>
      )}
      {isError && (
        <div className="mt-8">
          <p role="alert">Search failed.</p>
          <button type="button" onClick={() => void refetch()}>
            Retry
          </button>
        </div>
      )}
      {!isPending && !isError && (
        <>
          <p className="mt-6 text-sm text-muted-foreground">{results.length} results</p>
          {results.length === 0 ? (
            <p className="mt-8">No results found.</p>
          ) : (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {results.map(result => (
                <li
                  key={`${result.mediaType}:${result.id}`}
                  className="rounded border border-border p-3"
                >
                  <Link
                    to={
                      result.mediaType === 'person'
                        ? `/person/${result.id}`
                        : `/${result.mediaType}/${result.id}`
                    }
                    className="font-medium"
                  >
                    {'title' in result ? result.title : result.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{result.mediaType}</p>
                </li>
              ))}
            </ul>
          )}
          <div ref={observerElement}>
            {hasNextPage === true && isFetchingNextPage && <Loader />}
          </div>
        </>
      )}
    </main>
  );
};
