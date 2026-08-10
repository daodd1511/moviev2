import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse, delay } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { CatalogByDiscover } from './CatalogByDiscover';

import { server } from '@/test/server';

const emptyPage = { page: 1, totalPages: 1, results: [] };

const renderAt = (route: string, mediaType: 'movie' | 'tv') => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route
            path="/:media/discover/:discover"
            element={<CatalogByDiscover mediaType={mediaType} />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('CatalogByDiscover', () => {
  afterEach(() => server.resetHandlers());

  it('keeps the header, category rail, and filters mounted while results load', async () => {
    server.use(
      http.get('*/catalog/discover', async () => {
        await delay(150);
        return HttpResponse.json(emptyPage);
      }),
      http.get('*/catalog/genres', () => HttpResponse.json([])),
    );

    renderAt('/movie/discover/discover', 'movie');

    // While the request is still in flight the page chrome must already be on screen —
    // the bug this guards is `isPending` short-circuiting the whole render to a loader.
    expect(await screen.findByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Discover Movies' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Movie categories' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'movie catalog filters' })).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText('Nothing matches these filters yet.')).toBeInTheDocument(),
    );
  });

  it('keeps the chrome mounted when the catalog request fails', async () => {
    server.use(
      http.get('*/catalog/discover', () => HttpResponse.error()),
      http.get('*/catalog/genres', () => HttpResponse.json([])),
    );

    renderAt('/movie/discover/popular', 'movie');

    await screen.findByRole('alert');
    expect(screen.getByRole('heading', { name: 'Popular Movies' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Movie categories' })).toBeInTheDocument();
  });

  it('renders TV copy and routes from the same component', async () => {
    server.use(
      http.get('*/catalog/discover', () => HttpResponse.json(emptyPage)),
      http.get('*/catalog/genres', () => HttpResponse.json([])),
    );

    renderAt('/tv/discover/top_rated', 'tv');

    await screen.findByRole('heading', { name: 'Top Rated TV Shows' });
    expect(screen.getByRole('navigation', { name: 'TV categories' })).toBeInTheDocument();
  });
});
