import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';

import { LibraryEntryEditor } from './LibraryEntryEditor';

import { LibraryEntry } from '@/models/library-entry.model';
import { server } from '@/test/server';

const entry: LibraryEntry = {
  id: 'entry-1',
  mediaType: 'tv',
  tmdbId: 42,
  watchState: 'planned',
  rating: null,
  notes: null,
  startedAt: null,
  completedAt: null,
  lastWatchedAt: null,
  tvProgress: null,
  mediaSnapshot: { title: 'Fixture TV', posterPath: null, releaseDate: null, voteAverage: 8 },
  createdAt: '2026-08-02T00:00:00.000Z',
  updatedAt: '2026-08-02T00:00:00.000Z',
};

const renderEditor = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <LibraryEntryEditor entry={entry} />
    </QueryClientProvider>,
  );
};

describe('LibraryEntryEditor', () => {
  afterEach(() => server.resetHandlers());

  it('rejects non-integer ratings and invalid date order', async () => {
    const user = userEvent.setup();
    renderEditor();
    const rating = screen.getByLabelText('Rating (1–10)');
    await user.type(rating, '10.5');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Rating must be a whole number from 1 to 10.',
    );

    await user.clear(rating);
    await user.type(screen.getByLabelText('Started'), '2026-08-02');
    await user.type(screen.getByLabelText('Completed'), '2026-08-01');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Completed date must be on or after the started date.',
    );

    await user.clear(screen.getByLabelText('Started'));
    await user.clear(screen.getByLabelText('Completed'));
    await user.type(screen.getByLabelText('Season'), '0');
    await user.type(screen.getByLabelText('Episode'), '1');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'TV progress must use positive whole-number season and episode values.',
    );
  });

  it('supports keyboard submission and announces a successful save', async () => {
    server.use(http.put('*/library/entries', () => HttpResponse.json(entry)));
    const user = userEvent.setup();
    renderEditor();

    screen.getByRole('button', { name: 'Save changes' }).focus();
    await user.keyboard('{Enter}');

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Library entry saved.'),
    );
  });
});
