import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { MovieByDiscover } from './MovieByDiscover';

import { server } from '@/test/server';

const emptyPage = { page: 1, totalPages: 1, results: [] };

const renderAt = (route: string) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/movie/discover/:discover" element={<MovieByDiscover />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('MovieByDiscover', () => {
  afterEach(() => server.resetHandlers());

  it('requests the route category from the catalog and switches when the category changes', async () => {
    let lastCategory: string | null = null;
    server.use(
      http.get('*/catalog/discover', ({ request }) => {
        lastCategory = new URL(request.url).searchParams.get('category');
        return HttpResponse.json(emptyPage);
      }),
      http.get('*/catalog/genres', () => HttpResponse.json([])),
    );

    renderAt('/movie/discover/top_rated');
    await waitFor(() => expect(lastCategory).toBe('top_rated'));

    renderAt('/movie/discover/upcoming');
    await waitFor(() => expect(lastCategory).toBe('upcoming'));
  });

  it('sends no category when the Discover tab is active', async () => {
    let lastCategory: string | null | undefined;
    server.use(
      http.get('*/catalog/discover', ({ request }) => {
        lastCategory = new URL(request.url).searchParams.get('category');
        return HttpResponse.json(emptyPage);
      }),
      http.get('*/catalog/genres', () => HttpResponse.json([])),
    );

    renderAt('/movie/discover/discover');
    await waitFor(() => expect(lastCategory).toBeNull());
  });

  it('renders filters only on the Discover tab', async () => {
    server.use(
      http.get('*/catalog/discover', () => HttpResponse.json(emptyPage)),
      http.get('*/catalog/genres', () => HttpResponse.json([])),
    );

    renderAt('/movie/discover/popular');
    await screen.findByRole('heading', { name: 'Popular Movies' });
    expect(screen.queryByRole('region', { name: 'movie catalog filters' })).not.toBeInTheDocument();

    renderAt('/movie/discover/discover');
    await screen.findByRole('region', { name: 'movie catalog filters' });
  });
});
