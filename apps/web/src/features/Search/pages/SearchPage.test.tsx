import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
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
describe('SearchPage', () => {
  afterEach(() => server.resetHandlers());
  it('round-trips tabs and deterministic pagination through URL state', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/catalog/search', ({ request }) => {
        const url = new URL(request.url);
        return HttpResponse.json({
          page: Number(url.searchParams.get('page')),
          totalPages: 2,
          results: [
            {
              id: 1,
              mediaType: 'movie',
              title: 'Fixture',
              overview: '',
              posterPath: null,
              backdropPath: null,
              releaseDate: '',
              voteAverage: 0,
              popularity: 0,
            },
          ],
        });
      }),
    );
    renderPage('/search?q=fixture&type=movie&page=1');
    expect(await screen.findByText('Fixture')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Page 2')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'TV' }));
    expect(await screen.findByRole('tab', { name: 'TV', selected: true })).toBeInTheDocument();
  });
});
