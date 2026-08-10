import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SeasonDetailPage } from './SeasonDetailPage';

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
      overview: 'Season one summary.',
      poster_path: '/season-one.jpg',
      season_number: 1,
    },
  ],
};

const seasonDetail = (seasonNumber: number) => {
  if (seasonNumber === 0) {
    return {
      id: 100,
      air_date: '2023-01-01',
      episodes: [],
      name: 'Specials',
      overview: '',
      poster_path: '/specials.jpg',
      season_number: 0,
    };
  }

  if (seasonNumber === 2) {
    return {
      id: 102,
      air_date: null,
      episodes: [
        {
          id: 202,
          air_date: null,
          episode_number: 1,
          name: 'Future episode',
          overview: '',
          runtime: null,
          still_path: null,
          vote_average: 0,
        },
      ],
      name: 'Season 2',
      overview: '',
      poster_path: null,
      season_number: 2,
    };
  }

  return {
    id: 101,
    air_date: '2023-01-15',
    episodes: [
      {
        id: 201,
        air_date: '2026-08-03',
        episode_number: 1,
        name: 'Episode one',
        overview: 'The first fixture episode introduces the ledger.',
        runtime: 54,
        still_path: '/episode-one.jpg',
        vote_average: 8.4,
      },
      {
        id: 202,
        air_date: '2026-08-10',
        episode_number: 2,
        name: 'Episode two',
        overview: 'A second fixture episode.',
        runtime: 51,
        still_path: '/episode-two.jpg',
        vote_average: 0,
      },
    ],
    name: 'Season 1',
    overview: 'Season one summary.',
    poster_path: '/season-one.jpg',
    season_number: 1,
  };
};

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
};

const renderPage = (route = '/tv/42/season/1') => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route
            path="/tv/:id/season/:seasonNumber"
            element={
              <>
                <SeasonDetailPage />
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

const useSeasonHandlers = () => {
  server.use(
    http.get('*/tv/42', () => HttpResponse.json(tvDetail)),
    http.get('*/tv/42/season/:seasonNumber', ({ params }) =>
      HttpResponse.json(seasonDetail(Number(params.seasonNumber))),
    ),
  );
};

describe('SeasonDetailPage', () => {
  beforeEach(() => vi.stubGlobal('scrollTo', vi.fn()));

  afterEach(() => {
    server.resetHandlers();
    vi.unstubAllGlobals();
  });

  it('rejects invalid numeric route parameters before starting queries', () => {
    renderPage('/tv/not-a-number/season/1');

    expect(screen.getByRole('heading', { name: 'Not Found' })).toBeInTheDocument();
  });

  it('uses the standard loader while its data is pending', () => {
    useSeasonHandlers();
    server.use(
      http.get('*/tv/42', async () => {
        await delay(100);
        return HttpResponse.json(tvDetail);
      }),
    );

    renderPage();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders the selected ledger with public ratings and non-interactive episode rows', async () => {
    useSeasonHandlers();

    renderPage();

    expect(await screen.findByRole('heading', { name: 'Season 1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Episode one', level: 3 })).toBeInTheDocument();
    expect(screen.getByText('Aug 3, 2026 · 54 min')).toBeInTheDocument();
    expect(screen.getByLabelText('8.4 rating')).toBeInTheDocument();
    expect(screen.getByText('Not rated')).toBeInTheDocument();
    expect(screen.getByText('The first fixture episode introduces the ledger.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Episode one', level: 3 }).closest('a')).toBeNull();
  });

  it('changes the URL and loaded ledger through the native selector and season controls', async () => {
    useSeasonHandlers();
    const user = userEvent.setup();

    renderPage();

    await screen.findByRole('heading', { name: 'Season 1' });
    await user.selectOptions(screen.getByLabelText('Viewing'), '0');

    expect(await screen.findByRole('heading', { name: 'Specials' })).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/tv/42/season/0');

    await user.click(screen.getByRole('button', { name: 'Next season' }));
    expect(await screen.findByRole('heading', { name: 'Season 1' })).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/tv/42/season/1');
  });

  it('keeps incomplete episode metadata explicit', async () => {
    useSeasonHandlers();

    renderPage('/tv/42/season/2');

    expect(await screen.findByRole('heading', { name: 'Season 2' })).toBeInTheDocument();
    expect(screen.getAllByText('Not yet aired')).not.toHaveLength(0);
    expect(screen.getByText('Not rated')).toBeInTheDocument();
    expect(screen.getByAltText('Future episode still')).toHaveAttribute(
      'src',
      '/images/no-image.png',
    );
  });

  it('renders an empty-season state', async () => {
    useSeasonHandlers();

    renderPage('/tv/42/season/0');

    expect(await screen.findByRole('heading', { name: 'Specials' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'No episodes yet' })).toBeInTheDocument();
  });

  it('renders a retryable state when a season request fails', async () => {
    let shouldFail = true;
    server.use(
      http.get('*/tv/42', () => HttpResponse.json(tvDetail)),
      http.get('*/tv/42/season/1', () => {
        if (shouldFail) {
          shouldFail = false;
          return new HttpResponse(null, { status: 500 });
        }

        return HttpResponse.json(seasonDetail(1));
      }),
    );
    const user = userEvent.setup();

    renderPage();

    expect(await screen.findByRole('heading', { name: "Couldn't load this season" })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('heading', { name: 'Season 1' })).toBeInTheDocument();
  });
});
