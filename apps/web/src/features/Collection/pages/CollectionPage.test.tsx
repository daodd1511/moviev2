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

const profile = { id: 'user-1', username: 'casey' };

const renderPage = (initialPath = '/collections/collection-1') => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
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
        return HttpResponse.json({ ...collection, name: 'Road trip', description: null, visibility: 'private', items: [], cover: null }, { status: 201 });
      }),
    );
    renderPage('/collections/new');

    await user.type(screen.getByLabelText('Name'), 'Road trip');
    await user.selectOptions(screen.getByLabelText('Visibility'), 'private');
    await user.click(screen.getByRole('button', { name: 'Create Collection' }));

    await waitFor(() => expect(requestBody).toEqual({ name: 'Road trip', description: null, visibility: 'private', items: [], cover: null }));
  });

  it('reloads after a stale edit conflict and submits the canonical version', async () => {
    const user = userEvent.setup();
    let getCount = 0;
    let patchBody: unknown;
    server.use(
      http.get('*/collections/:id', () => {
        getCount += 1;
        return HttpResponse.json(getCount === 1 ? collection : { ...collection, version: 3, name: 'Server edit' });
      }),
      http.get('*/user/profile', () => HttpResponse.json(profile)),
      http.patch('*/collections/:id', async ({ request }) => {
        patchBody = await request.json();
        return HttpResponse.json({ error: { code: 'collection_version_conflict', message: 'Reload and retry.', requestId: 'req-1' } }, { status: 409 });
      }),
    );
    renderPage();

    await screen.findByRole('heading', { name: 'Edit Collection' });
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'My edited Collection');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(patchBody).toEqual({ name: 'My edited Collection', description: 'A good place to begin.', visibility: 'unlisted', version: 2 }));
    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue('Server edit'));
  });

  it('reorders titles and deletes the Collection with optimistic version values', async () => {
    const user = userEvent.setup();
    let reorderBody: unknown;
    let deleteBody: unknown;
    server.use(
      http.get('*/collections/:id', () => HttpResponse.json(collection)),
      http.get('*/user/profile', () => HttpResponse.json(profile)),
      http.put('*/collections/:id/items/order', async ({ request }) => {
        reorderBody = await request.json();
        return HttpResponse.json({ ...collection, items: [...collection.items].reverse(), version: 3 });
      }),
      http.delete('*/collections/:id', async ({ request }) => {
        deleteBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    renderPage();

    await screen.findByRole('heading', { name: 'Edit Collection' });
    await user.click(screen.getByRole('button', { name: 'Move First down' }));
    await waitFor(() => expect(reorderBody).toEqual({ version: 2, items: [{ mediaType: 'tv', tmdbId: 2 }, { mediaType: 'movie', tmdbId: 1 }] }));
    await screen.findByText('Version 3');
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete Collection' }));
    await waitFor(() => expect(deleteBody).toEqual({ version: 3 }));
    expect(await screen.findByText('Collection index')).toBeInTheDocument();
  });
});
