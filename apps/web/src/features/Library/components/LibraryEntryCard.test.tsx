import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { LibraryEntryCard } from './LibraryEntryCard';

import { LibraryEntry, LibraryEntrySort } from '@/models/library-entry.model';
import { server } from '@/test/server';

const baseEntry: LibraryEntry = {
  id: 'entry-1',
  mediaType: 'tv',
  tmdbId: 1,
  watchState: 'watching',
  rating: 8,
  notes: 'Great pacing in the second half.',
  startedAt: '2026-01-02T00:00:00.000Z',
  completedAt: null,
  lastWatchedAt: '2026-03-04T00:00:00.000Z',
  tvProgress: { season: 2, episode: 7, watchedEpisodeCount: 14 },
  mediaSnapshot: { title: 'Severance', posterPath: null, releaseDate: null, voteAverage: 8.5 },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-03-05T00:00:00.000Z',
};

const renderCard = (entry: LibraryEntry, sort?: LibraryEntrySort) => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LibraryEntryCard entry={entry} sort={sort} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('LibraryEntryCard', () => {
  afterEach(() => server.resetHandlers());

  it('shows TV progress, notes, and the state date without opening the editor', () => {
    renderCard(baseEntry);

    expect(screen.getByText('S2E7')).toBeInTheDocument();
    expect(screen.getByText('14 episodes watched')).toBeInTheDocument();
    expect(screen.getByText('Great pacing in the second half.')).toBeInTheDocument();
    expect(screen.getByText('Watching since Jan 2, 2026')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the editor in a dialog and closes it once the save succeeds', async () => {
    server.use(http.put('*/library/entries', () => HttpResponse.json(baseEntry)));
    const user = userEvent.setup();
    renderCard(baseEntry);

    await user.click(screen.getByRole('button', { name: 'Edit Severance' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAccessibleName('Edit Severance');

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('dismisses the editor without saving when cancelled', async () => {
    const user = userEvent.setup();
    renderCard(baseEntry);

    await user.click(screen.getByRole('button', { name: 'Edit Severance' }));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('confirms before removing the entry', async () => {
    let removed = false;
    server.use(
      http.delete('*/library/entries/:mediaType/:tmdbId', () => {
        removed = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderCard(baseEntry);

    await user.click(screen.getByRole('button', { name: 'Remove Severance' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Remove “Severance”?');
    expect(removed).toBe(false);

    await user.click(screen.getByRole('button', { name: 'Remove entry' }));

    await waitFor(() => expect(removed).toBe(true));
  });

  it('surfaces the sorted field alongside the state date', () => {
    renderCard(baseEntry, 'lastWatchedAt');

    expect(screen.getByText('Last watched Mar 4, 2026')).toBeInTheDocument();
  });

  it('does not repeat the state date when the sort uses the same field', () => {
    renderCard({ ...baseEntry, watchState: 'paused' }, 'lastWatchedAt');

    expect(screen.getAllByText('Last watched Mar 4, 2026')).toHaveLength(1);
  });

  it('omits dates the entry has not recorded', () => {
    renderCard({ ...baseEntry, watchState: 'planned', notes: null, tvProgress: null });

    expect(screen.queryByText(/Watching since/)).not.toBeInTheDocument();
    expect(screen.getByText('Updated Mar 5, 2026')).toBeInTheDocument();
  });
});
