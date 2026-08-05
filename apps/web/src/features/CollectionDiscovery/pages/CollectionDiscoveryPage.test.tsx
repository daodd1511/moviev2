import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
    expect(screen.getByText('3 titles')).toBeInTheDocument();
    // Like count sits with the heart control rather than in the count line.
    expect(screen.getByText('5')).toBeInTheDocument();

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

  it('loads a second page when the observer reports the sentinel is visible', async () => {
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

    const DISCOVERY_LIMIT = 24;
    const firstPage = Array.from({ length: DISCOVERY_LIMIT }, (_, index) => ({
      ...collections[0],
      id: `collection-${index}`,
      name: `Collection ${index}`,
    }));
    const secondPage = [{ ...collections[0], id: 'collection-last', name: 'Last collection' }];
    server.use(
      http.get('*/social/collections', ({ request }) => {
        const page = new URL(request.url).searchParams.get('page');
        return HttpResponse.json({ collections: page === '2' ? secondPage : firstPage });
      }),
    );

    renderPage(false);
    await screen.findByRole('link', { name: 'Collection 0' });
    expect(screen.queryByRole('link', { name: 'Last collection' })).not.toBeInTheDocument();

    observerRef.current?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );

    await screen.findByRole('link', { name: 'Last collection' });
    vi.unstubAllGlobals();
  });
});
