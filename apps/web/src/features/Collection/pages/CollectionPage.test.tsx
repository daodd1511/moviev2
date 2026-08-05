import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { CollectionPage } from './CollectionPage';
import { NewCollectionPage } from './NewCollectionPage';

import type { Collection } from '@/models/collection.model';
import { server } from '@/test/server';

const collection: Collection = {
  id: 'collection-1',
  ownerId: 'user-1',
  name: 'Weekend films',
  description: 'A good place to begin.',
  visibility: 'unlisted',
  items: [
    {
      mediaType: 'movie',
      tmdbId: 1,
      title: 'First',
      posterPath: null,
      releaseDate: '2020-01-01',
      voteAverage: 8,
    },
    {
      mediaType: 'tv',
      tmdbId: 2,
      title: 'Second',
      posterPath: null,
      releaseDate: '2021-01-01',
      voteAverage: 7,
    },
  ],
  collaborators: [{ userId: 'user-1', role: 'owner' }],
  cover: null,
  likeCount: 0,
  version: 2,
  legacyPublicId: null,
  createdAt: '2026-08-03T00:00:00.000Z',
  updatedAt: '2026-08-03T00:00:00.000Z',
};

const profile = { id: 'user-1', username: 'casey' };

const renderPage = (initialPath = '/collections/collection-1') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/collections/new" element={<NewCollectionPage />} />
          <Route path="/collections/:id" element={<CollectionPage />} />
          <Route path="/user/collections" element={<p>Collection index</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('Collection journeys', () => {
  afterEach(() => server.resetHandlers());

  it('creates a Collection with canonical metadata', async () => {
    const user = userEvent.setup();
    let requestBody: unknown;
    server.use(
      http.post('*/collections', async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json(
          {
            ...collection,
            name: 'Road trip',
            description: null,
            visibility: 'private',
            items: [],
            cover: null,
          },
          { status: 201 },
        );
      }),
    );
    renderPage('/collections/new');

    await user.type(screen.getByLabelText('Name'), 'Road trip');
    await user.click(screen.getByLabelText('Visibility'));
    await user.click(await screen.findByRole('option', { name: 'Private' }));
    await user.click(screen.getByRole('button', { name: 'Create Collection' }));

    await waitFor(() =>
      expect(requestBody).toEqual({
        name: 'Road trip',
        description: null,
        visibility: 'private',
        items: [],
        cover: null,
      }),
    );
  });

  it('preserves unsaved input after a stale edit conflict instead of overwriting it', async () => {
    const user = userEvent.setup();
    let getCount = 0;
    let patchBody: unknown;
    server.use(
      http.get('*/collections/invitations', () => HttpResponse.json({ invitations: [] })),
      http.get('*/collections/:id', () => {
        getCount += 1;
        return HttpResponse.json(
          getCount === 1 ? collection : { ...collection, version: 3, name: 'Server edit' },
        );
      }),
      http.get('*/user/profile', () => HttpResponse.json(profile)),
      http.patch('*/collections/:id', async ({ request }) => {
        patchBody = await request.json();
        return HttpResponse.json(
          {
            error: {
              code: 'collection_version_conflict',
              message: 'Reload and retry.',
              requestId: 'req-1',
            },
          },
          { status: 409 },
        );
      }),
    );
    renderPage();

    await screen.findByRole('heading', { name: 'Weekend films' });
    await user.click(screen.getByRole('button', { name: 'Edit details' }));
    await screen.findByRole('dialog');
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'My edited Collection');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(patchBody).toEqual({
        name: 'My edited Collection',
        description: 'A good place to begin.',
        visibility: 'unlisted',
        version: 2,
      }),
    );
    await waitFor(() => expect(getCount).toBe(2));
    expect(screen.getByLabelText('Name')).toHaveValue('My edited Collection');
    expect(screen.queryByText(/version/i)).not.toBeInTheDocument();
  });

  it('reorders titles and deletes the Collection with optimistic version values', async () => {
    const user = userEvent.setup();
    let reorderBody: unknown;
    let deleteBody: unknown;
    // Two movies around a TV title: reordering happens inside the Movies tab, so the
    // TV title must keep its position.
    const third = { ...collection.items[0], tmdbId: 3, title: 'Third' };
    const mixed = { ...collection, items: [...collection.items, third] };
    server.use(
      http.get('*/collections/invitations', () => HttpResponse.json({ invitations: [] })),
      http.get('*/collections/:id', () => HttpResponse.json(mixed)),
      http.get('*/user/profile', () => HttpResponse.json(profile)),
      http.put('*/collections/:id/items/order', async ({ request }) => {
        reorderBody = await request.json();
        return HttpResponse.json({
          ...mixed,
          items: [third, mixed.items[1], mixed.items[0]],
          version: 3,
        });
      }),
      http.delete('*/collections/:id', async ({ request }) => {
        deleteBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    renderPage();

    await screen.findByRole('heading', { name: 'Weekend films' });
    await user.click(screen.getByRole('button', { name: 'Move First later' }));
    await waitFor(() =>
      expect(reorderBody).toEqual({
        version: 2,
        items: [
          { mediaType: 'movie', tmdbId: 3 },
          { mediaType: 'tv', tmdbId: 2 },
          { mediaType: 'movie', tmdbId: 1 },
        ],
      }),
    );
    // Confirms the reorder mutation's response (version 3) landed before deleting, so
    // deleteBody below reflects it rather than the stale pre-reorder version.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Move First later' })).toBeDisabled(),
    );
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete Collection' }));
    await waitFor(() => expect(deleteBody).toEqual({ version: 3 }));
    expect(await screen.findByText('Collection index')).toBeInTheDocument();
  });
});
