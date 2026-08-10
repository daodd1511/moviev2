import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { TvQueries } from './tvQueries';

import { server } from '@/test/server';

const seasonDetail = (seasonNumber: number) => ({
  id: 100 + seasonNumber,
  air_date: '2026-08-03',
  episodes: [],
  name: seasonNumber === 0 ? 'Specials' : `Season ${seasonNumber}`,
  overview: '',
  poster_path: null,
  season_number: seasonNumber,
});

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, wrapper };
};

describe('TvQueries season detail queries', () => {
  afterEach(() => server.resetHandlers());

  it('uses the canonical key and reuses one request across single and multi-season reads', async () => {
    const requestedSeasons: number[] = [];
    server.use(
      http.get('*/tv/42/season/:seasonNumber', ({ params }) => {
        const seasonNumber = Number(params.seasonNumber);
        requestedSeasons.push(seasonNumber);
        return HttpResponse.json(seasonDetail(seasonNumber));
      }),
    );
    const { queryClient, wrapper } = createWrapper();

    const { result } = renderHook(
      () => ({
        single: TvQueries.useSeasonDetail(42, 1),
        multiple: TvQueries.useSeasonDetails(42, [1, 2]),
      }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.single.isSuccess).toBe(true);
      expect(result.current.multiple.every(query => query.isSuccess)).toBe(true);
    });

    expect(TvQueries.seasonDetailOptions(42, 1).queryKey).toEqual(['tvSeasonDetail', 42, 1]);
    expect(requestedSeasons.sort()).toEqual([1, 2]);
    expect(queryClient.getQueryData(['tvSeasonDetail', 42, 1])).toEqual(result.current.single.data);
    expect(result.current.multiple.map(query => query.data?.seasonNumber)).toEqual([1, 2]);
  });

  it('keeps successful seasons usable when another season fails', async () => {
    server.use(
      http.get('*/tv/42/season/:seasonNumber', ({ params }) => {
        const seasonNumber = Number(params.seasonNumber);
        return seasonNumber === 2
          ? new HttpResponse(null, { status: 500 })
          : HttpResponse.json(seasonDetail(seasonNumber));
      }),
    );
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => TvQueries.useSeasonDetails(42, [1, 2, 3]), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current[0].isSuccess).toBe(true);
      expect(result.current[1].isError).toBe(true);
      expect(result.current[2].isSuccess).toBe(true);
    });

    expect(result.current.map(query => query.data?.seasonNumber)).toEqual([1, undefined, 3]);
  });
});
