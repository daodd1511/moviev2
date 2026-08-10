import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SeriesQualityPage } from './SeriesQualityPage';

import { server } from '@/test/server';

const tvDetail = {
  id: 42,
  name: 'Fixture show',
  original_name: 'Fixture show',
  overview: 'A fixture show.',
  poster_path: '/show.jpg',
  backdrop_path: '/backdrop.jpg',
  popularity: 10,
  vote_average: 8.2,
  vote_count: 100,
  original_language: 'en',
  genre_ids: [],
  first_air_date: '2023-01-01',
  origin_country: ['US'],
  tagline: '',
  genres: [],
  videos: { id: 42, results: [] },
  seasons: [
    {
      id: 100,
      air_date: '2023-01-01',
      episode_count: 1,
      name: 'Specials',
      overview: '',
      poster_path: '/specials.jpg',
      season_number: 0,
    },
    {
      id: 101,
      air_date: '2023-01-15',
      episode_count: 2,
      name: 'Season 1',
      overview: '',
      poster_path: '/season-one.jpg',
      season_number: 1,
    },
    {
      id: 102,
      air_date: '2024-01-15',
      episode_count: 3,
      name: 'Season 2',
      overview: '',
      poster_path: '/season-two.jpg',
      season_number: 2,
    },
  ],
};

const episode = (id: number, episodeNumber: number, name: string, voteAverage: number) => ({
  id,
  air_date: '2026-08-03',
  episode_number: episodeNumber,
  name,
  overview: `${name} overview.`,
  runtime: 50,
  still_path: null,
  vote_average: voteAverage,
});

const seasonDetail = (seasonNumber: number) => {
  if (seasonNumber === 0) {
    return {
      id: 100,
      air_date: '2023-01-01',
      episodes: [episode(1, 1, 'Special episode', 10)],
      name: 'Specials',
      overview: '',
      poster_path: '/specials.jpg',
      season_number: 0,
    };
  }

  if (seasonNumber === 1) {
    return {
      id: 101,
      air_date: '2023-01-15',
      episodes: [episode(11, 1, 'Season one premiere', 9.2), episode(12, 2, 'Unrated episode', 0)],
      name: 'Season 1',
      overview: '',
      poster_path: '/season-one.jpg',
      season_number: 1,
    };
  }

  return {
    id: 102,
    air_date: '2024-01-15',
    episodes: [episode(21, 1, 'Season two premiere', 7), episode(23, 3, 'Season two finale', 4.8)],
    name: 'Season 2',
    overview: '',
    poster_path: '/season-two.jpg',
    season_number: 2,
  };
};

const longSeasonDetail = {
  ...seasonDetail(2),
  episodes: Array.from({ length: 16 }, (_, index) =>
    episode(200 + index, index + 1, `Long season episode ${index + 1}`, 7.5),
  ),
};

const renderPage = (route = '/tv/42/quality') => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/tv/:id/quality" element={<SeriesQualityPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

const useQualityHandlers = (onSeasonRequest?: (seasonNumber: number) => void) => {
  server.use(
    http.get('*/tv/42', () => HttpResponse.json(tvDetail)),
    http.get('*/tv/42/season/:seasonNumber', ({ params }) => {
      const seasonNumber = Number(params.seasonNumber);
      onSeasonRequest?.(seasonNumber);
      return HttpResponse.json(seasonDetail(seasonNumber));
    }),
  );
};

describe('SeriesQualityPage', () => {
  beforeEach(() => vi.stubGlobal('scrollTo', vi.fn()));

  afterEach(() => {
    server.resetHandlers();
    vi.unstubAllGlobals();
  });

  it('rejects an invalid TV id before starting queries', () => {
    renderPage('/tv/not-a-number/quality');

    expect(screen.getByRole('heading', { name: 'Not Found' })).toBeInTheDocument();
  });

  it('requests every numbered season immediately while showing the standard loader', async () => {
    const requestedSeasons: number[] = [];
    server.use(
      http.get('*/tv/42', () => HttpResponse.json(tvDetail)),
      http.get('*/tv/42/season/:seasonNumber', async ({ params }) => {
        const seasonNumber = Number(params.seasonNumber);
        requestedSeasons.push(seasonNumber);
        await delay(100);
        return HttpResponse.json(seasonDetail(seasonNumber));
      }),
    );

    renderPage();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => expect([...requestedSeasons].sort()).toEqual([1, 2]));
    expect(requestedSeasons).not.toContain(0);
  });

  it('keeps series and episode aggregates distinct and exposes all matrix states', async () => {
    useQualityHandlers();

    renderPage();

    expect(await screen.findByRole('heading', { name: 'Fixture show' })).toBeInTheDocument();
    expect(screen.getByText('Series rating').parentElement).toHaveTextContent('8.2');
    expect(screen.getByText('Episode average').parentElement).toHaveTextContent('7.0');
    expect(screen.getByLabelText('S1, episode 1, rated 9.2')).toHaveTextContent('9.2');
    expect(screen.getByLabelText('S1, episode 2, not rated')).toHaveTextContent('?');
    expect(screen.getByLabelText('S1, episode 3, no episode at this position')).toHaveTextContent(
      '—',
    );
    expect(screen.getByLabelText('S2, episode 2, no episode at this position')).toHaveTextContent(
      '—',
    );
    expect(screen.getByLabelText('Episode quality bands')).toHaveTextContent(
      'AwesomeGreatGoodRegularBadGarbage',
    );
  });

  it('selects a rated cell and links the inspector to its anchored ledger row', async () => {
    useQualityHandlers();
    const user = userEvent.setup();

    renderPage();

    const ratedCell = await screen.findByLabelText('S1, episode 1, rated 9.2');
    await user.click(ratedCell);

    expect(ratedCell).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'Season one premiere' })).toBeInTheDocument();
    expect(screen.getByText(/Awesome · Matches the season average/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View in Season/ })).toHaveAttribute(
      'href',
      '/tv/42/season/1#episode-1',
    );
  });

  it('fetches Specials on demand and includes it in the visible episode average', async () => {
    const requestedSeasons: number[] = [];
    useQualityHandlers(seasonNumber => requestedSeasons.push(seasonNumber));
    const user = userEvent.setup();

    renderPage();

    await screen.findByRole('heading', { name: 'Fixture show' });
    expect(screen.getByText('Episode average').parentElement).toHaveTextContent('7.0');
    expect(requestedSeasons).not.toContain(0);
    expect(screen.getByRole('checkbox', { name: 'Show Specials' })).toHaveAttribute(
      'data-slot',
      'checkbox',
    );

    await user.click(screen.getByRole('checkbox', { name: 'Show Specials' }));

    expect(await screen.findByLabelText('Specials, episode 1, rated 10.0')).toBeInTheDocument();
    expect(requestedSeasons).toContain(0);
    expect(screen.getByText('Episode average').parentElement).toHaveTextContent('7.8');
  });

  it('compacts long seasons without creating a nested vertical scroll area', async () => {
    server.use(
      http.get('*/tv/42', () => HttpResponse.json(tvDetail)),
      http.get('*/tv/42/season/:seasonNumber', ({ params }) => {
        const seasonNumber = Number(params.seasonNumber);
        return HttpResponse.json(
          seasonNumber === 2 ? longSeasonDetail : seasonDetail(seasonNumber),
        );
      }),
    );

    renderPage();

    await screen.findByLabelText('S2, episode 16, rated 7.5');
    const matrix = screen.getByLabelText('Episode rating matrix');
    const grid = matrix.firstElementChild;

    expect(matrix).toHaveClass('overflow-x-auto');
    expect(matrix).not.toHaveClass('max-h-[72vh]');
    expect(grid).toHaveAttribute('data-density', 'compact');
    expect(grid).toHaveClass('gap-y-1');
  });

  it('keeps successful columns visible and retries one unavailable season independently', async () => {
    let failSeasonTwo = true;
    server.use(
      http.get('*/tv/42', () => HttpResponse.json(tvDetail)),
      http.get('*/tv/42/season/:seasonNumber', ({ params }) => {
        const seasonNumber = Number(params.seasonNumber);
        if (seasonNumber === 2 && failSeasonTwo) {
          failSeasonTwo = false;
          return new HttpResponse(null, { status: 500 });
        }
        return HttpResponse.json(seasonDetail(seasonNumber));
      }),
    );
    const user = userEvent.setup();

    renderPage();

    expect(await screen.findByLabelText('S1, episode 1, rated 9.2')).toBeInTheDocument();
    expect(screen.getAllByLabelText('S2 unavailable')).not.toHaveLength(0);
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByLabelText('S2, episode 1, rated 7.0')).toBeInTheDocument();
  });

  it('uses a full-page retry only when every regular season fails', async () => {
    let remainingFailures = 2;
    server.use(
      http.get('*/tv/42', () => HttpResponse.json(tvDetail)),
      http.get('*/tv/42/season/:seasonNumber', ({ params }) => {
        if (remainingFailures > 0) {
          remainingFailures -= 1;
          return new HttpResponse(null, { status: 500 });
        }
        return HttpResponse.json(seasonDetail(Number(params.seasonNumber)));
      }),
    );
    const user = userEvent.setup();

    renderPage();

    expect(
      await screen.findByRole('heading', { name: "Couldn't load Series quality" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('heading', { name: 'Fixture show' })).toBeInTheDocument();
  });
});
