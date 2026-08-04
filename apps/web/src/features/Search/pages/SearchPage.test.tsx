import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SearchPage } from './SearchPage';
import { server } from '@/test/server';

const renderPage = (path = '/search?q=fixture') =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

const resultFor = (title: string) => ({
  id: title === 'Fixture' ? 1 : 2,
  mediaType: 'movie',
  title,
  overview: '',
  posterPath: null,
  backdropPath: null,
  releaseDate: '',
  voteAverage: 0,
  popularity: 0,
});

describe('SearchPage', () => {
  afterEach(() => server.resetHandlers());

  it('scrolls to a second page and round-trips the result-type tab through URL state', async () => {
    const observerRef: { current: IntersectionObserverCallback | null } = { current: null };
    class FakeIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = '';
      readonly thresholds: readonly number[] = [];
      readonly scrollMargin = '';
      constructor(callback: IntersectionObserverCallback) {
        observerRef.current = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    }
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);

    const user = userEvent.setup();
    server.use(
      http.get('*/catalog/search', ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page'));
        return HttpResponse.json({
          page,
          totalPages: 2,
          results: [resultFor(page === 2 ? 'Fixture page 2' : 'Fixture')],
        });
      }),
    );

    renderPage('/search?q=fixture&type=movie');
    expect(await screen.findByText('Fixture')).toBeInTheDocument();
    expect(screen.queryByText('Fixture page 2')).not.toBeInTheDocument();

    observerRef.current?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    expect(await screen.findByText('Fixture page 2')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'TV' }));
    expect(await screen.findByRole('tab', { name: 'TV', selected: true })).toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});
