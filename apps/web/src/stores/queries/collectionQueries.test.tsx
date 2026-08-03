import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { CollectionQueries, collectionKeys } from './collectionQueries';

import type { Collection } from '@/models/collection.model';
import { server } from '@/test/server';

const collection: Collection = {
  id: 'collection-1',
  ownerId: 'user-1',
  name: 'Weekend films',
  description: null,
  visibility: 'private',
  items: [
    { mediaType: 'movie', tmdbId: 1, title: 'First', posterPath: null, releaseDate: '2020-01-01', voteAverage: 8 },
    { mediaType: 'tv', tmdbId: 2, title: 'Second', posterPath: null, releaseDate: '2021-01-01', voteAverage: 7 },
  ],
  collaborators: [{ userId: 'user-1', role: 'owner' }],
  cover: null,
  version: 2,
  legacyPublicId: null,
  createdAt: '2026-08-03T00:00:00.000Z',
  updatedAt: '2026-08-03T00:00:00.000Z',
};

const renderMutation = <T,>(useMutation: () => T) => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  return { ...renderHook(useMutation, { wrapper }), queryClient };
};

describe('CollectionQueries', () => {
  afterEach(() => server.resetHandlers());

  it('updates the Collection list and detail caches after an edit', async () => {
    const edited = { ...collection, name: 'Edited Collection', version: 3 };
    server.use(http.patch('*/collections/:id', () => HttpResponse.json(edited)));
    const { result, queryClient } = renderMutation(CollectionQueries.useUpdate);
    queryClient.setQueryData(collectionKeys.list(), [collection] as readonly Collection[]);
    queryClient.setQueryData(collectionKeys.detail(collection.id), collection);

    result.current.mutate({ id: collection.id, version: collection.version, name: edited.name });

    await waitFor(() => expect(queryClient.getQueryData(collectionKeys.detail(collection.id))).toEqual(edited));
    expect(queryClient.getQueryData(collectionKeys.list())).toEqual([edited]);
  });

  it('uses canonical ordered item keys for a reorder', async () => {
    const reordered = { ...collection, items: [...collection.items].reverse(), version: 3 };
    let requestBody: unknown;
    server.use(
      http.put('*/collections/:id/items/order', async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json(reordered);
      }),
    );
    const { result } = renderMutation(CollectionQueries.useReorder);

    result.current.mutate({
      id: collection.id,
      version: collection.version,
      items: reordered.items.map(({ mediaType, tmdbId }) => ({ mediaType, tmdbId })),
    });

    await waitFor(() => expect(result.current.data).toEqual(reordered));
    expect(requestBody).toEqual({
      version: 2,
      items: [{ mediaType: 'tv', tmdbId: 2 }, { mediaType: 'movie', tmdbId: 1 }],
    });
  });
});
