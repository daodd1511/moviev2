import { Link, useSearchParams } from 'react-router-dom';
import { CatalogQueries } from '@/stores/queries/catalogQueries';
import type { CatalogSearchType } from '@/models/catalog-query.model';

const validType = (value: string | null): CatalogSearchType =>
  value === 'movie' || value === 'tv' || value === 'person' ? value : 'multi';
const validPage = (value: string | null): number => Math.max(1, Number(value) || 1);
export const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const query = params.get('q')?.trim() ?? '';
  const type = validType(params.get('type'));
  const page = validPage(params.get('page'));
  const { data, isPending, isError, refetch } = CatalogQueries.useSearch(query, type, page);
  const setParam = (next: Record<string, string>) =>
    setParams({ q: query, type, page: '1', ...next });
  if (query === '')
    return (
      <main className="px-4 py-8 md:px-8">
        <h1 className="text-2xl font-semibold">Search</h1>
        <p className="mt-3 text-muted-foreground">
          Search for movies, TV, and people from the quick search dialog.
        </p>
      </main>
    );
  return (
    <main className="px-4 py-8 md:px-8">
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
      {data !== undefined && !isPending && !isError && (
        <>
          <p className="mt-6 text-sm text-muted-foreground">{data.results.length} results</p>
          {data.results.length === 0 ? (
            <p className="mt-8">No results found.</p>
          ) : (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {data.results.map(result => (
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
          {data.totalPages > 1 && (
            <nav className="mt-8 flex gap-3" aria-label="Search pages">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setParam({ page: String(page - 1) })}
              >
                Previous
              </button>
              <span>Page {page}</span>
              <button
                type="button"
                disabled={page >= data.totalPages}
                onClick={() => setParam({ page: String(page + 1) })}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
};
