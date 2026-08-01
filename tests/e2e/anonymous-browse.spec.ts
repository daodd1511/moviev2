import { expect, test } from '@playwright/test';

const movie = {
  adult: false,
  backdrop_path: '/backdrop.jpg',
  genre_ids: [1],
  id: 42,
  media_type: 'movie',
  original_language: 'en',
  original_title: 'Fixture Movie',
  overview: 'A deterministic catalog fixture.',
  popularity: 10,
  poster_path: '/poster.jpg',
  release_date: '2026-01-01',
  title: 'Fixture Movie',
  video: false,
  vote_average: 8.4,
  vote_count: 100,
};

const catalogPage = { page: 1, results: [movie], total_pages: 1, total_results: 1 };

test.beforeEach(async ({ page }) => {
  await page.route('http://tmdb.test/**', async route => {
    const pathname = new URL(route.request().url()).pathname;

    if (pathname === '/3/movie/popular' || pathname === '/3/search/multi') {
      await route.fulfill({ json: catalogPage });
      return;
    }

    if (pathname === '/3/movie/42') {
      await route.fulfill({
        json: {
          ...movie,
          budget: 0,
          genres: [{ id: 1, name: 'Drama' }],
          homepage: '',
          imdb_id: null,
          revenue: 0,
          runtime: 120,
          spoken_languages: [{ english_name: 'English', iso_639_1: 'en', name: 'English' }],
          status: 'Released',
          tagline: 'A deterministic detail page.',
          videos: { results: [] },
        },
      });
      return;
    }

    if (pathname === '/3/movie/42/credits') {
      await route.fulfill({ json: { cast: [], crew: [] } });
      return;
    }

    if (pathname === '/3/movie/42/recommendations') {
      await route.fulfill({ json: { ...catalogPage, results: [] } });
      return;
    }

    await route.fulfill({ status: 404, json: { status_message: 'Unexpected catalog request' } });
  });
});

test('browses, quick-searches, and opens a mocked movie detail', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Popular Movies' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Fixture Movie poster/i })).toBeVisible();

  await page.getByRole('button', { name: 'Search movies and TV shows' }).first().click();
  await page.getByRole('searchbox', { name: 'Search movies and TV shows' }).fill('Fixture');
  await expect(page.getByRole('link', { name: /Fixture Movie/i })).toBeVisible();

  await page.getByRole('link', { name: /Fixture Movie/i }).click();
  await expect(page).toHaveURL(/#\/movie\/42$/);
  await expect(page.getByRole('heading', { name: 'Fixture Movie' })).toBeVisible();
});
