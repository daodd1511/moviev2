import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { LibraryEntryQueries } from './libraryEntryQueries';

import { LibraryEntry, LibraryEntryInput } from '@/models/library-entry.model';
import { server } from '@/test/server';

const input: LibraryEntryInput = {
  mediaType: 'movie',
  tmdbId: 42,
  watchState: 'planned',
  rating: null,
  notes: null,
  startedAt: null,
  completedAt: null,
  lastWatchedAt: null,
  tvProgress: null,
  mediaSnapshot: { title: 'Fixture Movie', posterPath: null, releaseDate: null, voteAverage: 8 },
};

const entry: LibraryEntry = {
  id: 'entry-1',
  ...input,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

const renderMutation = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { ...renderHook(() => LibraryEntryQueries.useUpsert(), { wrapper }), queryClient };
};

const renderRemoveMutation = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { ...renderHook(() => LibraryEntryQueries.useRemove(), { wrapper }), queryClient };
};

describe('LibraryEntryQueries.useUpsert', () => {
  afterEach(() => server.resetHandlers());

  it('replaces the optimistic entry with the API response', async () => {
    server.use(http.put('*/library/entries', () => HttpResponse.json(entry)));
    const { result, queryClient } = renderMutation();
    const queryKey = ['libraryEntries', 'list', {}] as const;
    queryClient.setQueryData(queryKey, [] as readonly LibraryEntry[]);

    result.current.mutate(input);

    await waitFor(() =>
      expect(queryClient.getQueryData<readonly LibraryEntry[]>(queryKey)).toEqual([entry]),
    );
  });

  it('restores cached entries when an upsert fails', async () => {
    server.use(http.put('*/library/entries', () => HttpResponse.json({}, { status: 500 })));
    const { result, queryClient } = renderMutation();
    const queryKey = ['libraryEntries', 'list', {}] as const;
    queryClient.setQueryData(queryKey, [entry] as readonly LibraryEntry[]);

    result.current.mutate({ ...input, watchState: 'watching' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData<readonly LibraryEntry[]>(queryKey)).toEqual([entry]);
  });
});

describe('LibraryEntryQueries.useRemove', () => {
  afterEach(() => server.resetHandlers());

  it('removes the matching title from the cached Library list', async () => {
    server.use(
      http.delete(
        '*/library/entries/:mediaType/:tmdbId',
        () => new HttpResponse(null, { status: 204 }),
      ),
    );
    const { result, queryClient } = renderRemoveMutation();
    const queryKey = ['libraryEntries', 'list', {}] as const;
    queryClient.setQueryData(queryKey, [entry] as readonly LibraryEntry[]);

    result.current.mutate({ mediaType: 'movie', tmdbId: 42 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData<readonly LibraryEntry[]>(queryKey)).toEqual([]);
  });
});
