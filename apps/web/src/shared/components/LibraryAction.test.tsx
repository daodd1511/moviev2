import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { LibraryAction } from './LibraryAction';

import { Media } from '@/models';
import { isAuthAtom } from '@/stores/atoms/authAtoms';
import { server } from '@/test/server';

const media = new Media({
  id: 42,
  posterPath: null,
  releaseDate: '2020-01-01',
  title: 'Fixture Movie',
  voteAverage: 8,
  type: 'movie',
});

const renderAction = (isAuthenticated: boolean) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <JotaiProvider initialValues={[[isAuthAtom, isAuthenticated]]}>
        <MemoryRouter initialEntries={['/movie/42']}>
          <LibraryAction media={media} />
        </MemoryRouter>
      </JotaiProvider>
    </QueryClientProvider>,
  );
};

describe('LibraryAction', () => {
  afterEach(() => server.resetHandlers());

  it('sends unauthenticated users to login with a safe return path', () => {
    renderAction(false);

    expect(screen.getByRole('link', { name: 'Log in to add to Library' })).toHaveAttribute(
      'href',
      '/auth/login?redirect=%2Fmovie%2F42',
    );
  });

  it('adds a title and announces the result for authenticated users', async () => {
    server.use(
      http.get('*/library/entries', () => HttpResponse.json({ entries: [] })),
      http.put('*/library/entries', () =>
        HttpResponse.json({
          id: 'entry-1',
          mediaType: 'movie',
          tmdbId: 42,
          watchState: 'planned',
          rating: null,
          notes: null,
          startedAt: null,
          completedAt: null,
          lastWatchedAt: null,
          tvProgress: null,
          mediaSnapshot: {
            title: 'Fixture Movie',
            posterPath: null,
            releaseDate: '2020-01-01T00:00:00.000Z',
            voteAverage: 8,
          },
          createdAt: '2026-08-01T00:00:00.000Z',
          updatedAt: '2026-08-01T00:00:00.000Z',
        }),
      ),
    );
    const user = userEvent.setup();
    renderAction(true);

    const button = await screen.findByRole('button', { name: 'Add to Library' });
    await user.click(button);

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Fixture Movie added to your Library.'),
    );
  });
});
