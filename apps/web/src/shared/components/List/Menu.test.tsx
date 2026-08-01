import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { PropsWithChildren } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAddToList } from './useAddToList';

import { List, Media } from '@/models';
import { MediaType } from '@/shared/enums/mediaType';
import { server } from '@/test/server';

vi.mock('react-toastify', async () => {
  const actual = await vi.importActual<typeof import('react-toastify')>('react-toastify');
  return { ...actual, toast: { ...actual.toast, error: vi.fn(), success: vi.fn() } };
});

const buildMedia = (overrides: Partial<Media> = {}): Media =>
  new Media({
    id: 1,
    posterPath: null,
    releaseDate: '2020-01-01',
    title: 'Test Movie',
    voteAverage: 7.5,
    type: MediaType.Movie,
    ...overrides,
  });

const buildList = (overrides: Partial<List> = {}): List =>
  new List({
    id: 'list-1',
    name: 'My List',
    description: '',
    movies: [],
    tvShows: [],
    createAt: new Date(),
    updateAt: new Date(),
    ...overrides,
  });

const renderUseAddToList = (media: Media) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useAddToList(media), { wrapper });
  return { result, invalidateSpy };
};

describe('useAddToList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('reports a duplicate without mutating when the media is already in the list', async () => {
    const { toast } = await import('react-toastify');
    const media = buildMedia();
    const list = buildList({ movies: [media] });
    const { result, invalidateSpy } = renderUseAddToList(media);

    result.current.addToList(list);

    expect(toast.error).toHaveBeenCalledWith('Movie already in list');
    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it('adds the media, invalidates affected queries, and reports success', async () => {
    const { toast } = await import('react-toastify');
    server.use(http.put('*/list/:id', () => HttpResponse.json({ ok: true })));
    const media = buildMedia();
    const list = buildList();
    const { result, invalidateSpy } = renderUseAddToList(media);

    result.current.addToList(list);

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Movie added to "My List"'));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['lists'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['listDetail', list.id] });
  });

  it('reports the API error envelope message when the mutation fails', async () => {
    const { toast } = await import('react-toastify');
    server.use(
      http.put('*/list/:id', () =>
        HttpResponse.json(
          { error: { code: 'list_not_found', message: 'List not found.', requestId: 'req-1' } },
          { status: 404 },
        ),
      ),
    );
    const media = buildMedia();
    const list = buildList();
    const { result } = renderUseAddToList(media);

    result.current.addToList(list);

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('List not found.'));
  });

  it('does not treat a TV show and a movie with the same numeric id as duplicates', async () => {
    const { toast } = await import('react-toastify');
    server.use(http.put('*/list/:id', () => HttpResponse.json({ ok: true })));
    const movie = buildMedia({ id: 42, type: MediaType.Movie });
    const tv = buildMedia({ id: 42, type: MediaType.Tv });
    const list = buildList({ movies: [movie] });
    const { result } = renderUseAddToList(tv);

    result.current.addToList(list);

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Show added to "My List"'));
    expect(toast.error).not.toHaveBeenCalled();
  });
});
