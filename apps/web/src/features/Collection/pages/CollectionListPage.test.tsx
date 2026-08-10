import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { CollectionListPage } from './CollectionListPage';

import type { Collection } from '@/models/collection.model';
import { server } from '@/test/server';

const collection: Collection = {
  id: 'collection-1',
  ownerId: 'user-1',
  name: 'Weekend films',
  description: 'A good place to begin.',
  visibility: 'unlisted',
  items: [],
  cover: null,
  likeCount: 0,
  collaborators: [],
  version: 1,
  createdAt: '2026-08-02T00:00:00.000Z',
  updatedAt: '2026-08-02T00:00:00.000Z',
};

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CollectionListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('CollectionListPage', () => {
  afterEach(() => server.resetHandlers());

  it('keeps the poster hover transform out of the title layer', async () => {
    server.use(http.get('*/collections', () => HttpResponse.json({ collections: [collection] })));

    renderPage();

    const title = await screen.findByRole('heading', { name: 'Weekend films' });
    expect(title.parentElement).toHaveClass('relative', 'z-10');
    expect(title.parentElement?.previousElementSibling).toHaveClass('overflow-hidden');
  });
});
