import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { CollectionDiscoveryPage } from './CollectionDiscoveryPage';

import { isAuthAtom } from '@/stores/atoms/authAtoms';
import { server } from '@/test/server';

const collections = [
  {
    id: 'collection-1',
    ownerUsername: 'riley',
    name: 'Weekend films',
    description: 'Cozy picks.',
    cover: null,
    itemCount: 3,
    likeCount: 5,
    createdAt: '2026-08-01T00:00:00.000Z',
  },
];

const renderPage = (isAuthenticated: boolean, initialPath = '/collections/discover') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <JotaiProvider initialValues={[[isAuthAtom, isAuthenticated]]}>
        <MemoryRouter initialEntries={[initialPath]}>
          <CollectionDiscoveryPage />
        </MemoryRouter>
      </JotaiProvider>
    </QueryClientProvider>,
  );
};

describe('CollectionDiscoveryPage', () => {
  afterEach(() => server.resetHandlers());

  it('shows an empty state when there are no public Collections', async () => {
    server.use(http.get('*/social/collections', () => HttpResponse.json({ collections: [] })));
    renderPage(false);

    expect(
      await screen.findByRole('heading', { name: 'No public Collections yet' }),
    ).toBeInTheDocument();
  });

  it('shows an error state when discovery fails to load', async () => {
    server.use(http.get('*/social/collections', () => HttpResponse.json({}, { status: 500 })));
    renderPage(false);

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not load/i);
  });

  it('lists public Collections, links to the owner-scoped canonical URL, and re-sorts on change', async () => {
    let lastSort: string | null = null;
    server.use(
      http.get('*/social/collections', ({ request }) => {
        lastSort = new URL(request.url).searchParams.get('sort');
        return HttpResponse.json({ collections });
      }),
    );
    const user = userEvent.setup();
    renderPage(false);

    const link = await screen.findByRole('link', { name: 'Weekend films' });
    expect(link).toHaveAttribute('href', '/u/riley/collections/collection-1');
    expect(screen.getByText('by @riley')).toBeInTheDocument();
    expect(screen.getByText('3 titles · 5 likes')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Sort by'));
    await user.click(await screen.findByRole('option', { name: 'Most liked' }));
    await waitFor(() => expect(lastSort).toBe('popular'));
  });

  it('lets an authenticated viewer like a Collection from the grid', async () => {
    let likedId: string | null = null;
    server.use(
      http.get('*/social/collections', () => HttpResponse.json({ collections })),
      http.post('*/social/collections/collection-1/like', () => {
        likedId = 'collection-1';
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderPage(true);

    await user.click(await screen.findByRole('button', { name: 'Like Weekend films' }));
    await waitFor(() => expect(likedId).toBe('collection-1'));
  });

  it('hides the like control for unauthenticated viewers', async () => {
    server.use(http.get('*/social/collections', () => HttpResponse.json({ collections })));
    renderPage(false);

    await screen.findByRole('link', { name: 'Weekend films' });
    expect(screen.queryByRole('button', { name: 'Like Weekend films' })).not.toBeInTheDocument();
  });
});
