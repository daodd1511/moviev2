import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addDays, format, startOfMonth } from 'date-fns';
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

// Two days within the current calendar month, so the date picker's default month view
// (which opens on today's month) shows both without navigation.
const monthStart = startOfMonth(new Date());
const earlierDay = addDays(monthStart, 8);
const laterDay = addDays(monthStart, 9);
const dayButtonName = (day: Date) => new RegExp(`${format(day, 'EEEE, MMMM do, yyyy')}$`);

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

  it('validates date order and TV progress', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByLabelText('Started'));
    await user.click(screen.getByRole('button', { name: dayButtonName(laterDay) }));
    await user.click(screen.getByLabelText('Completed'));
    await user.click(screen.getByRole('button', { name: dayButtonName(earlierDay) }));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Completed date must be on or after the started date.',
    );

    const startedTrigger = screen.getByLabelText('Started').parentElement;
    const completedTrigger = screen.getByLabelText('Completed').parentElement;
    if (startedTrigger === null || completedTrigger === null) {
      throw new Error('Expected Started/Completed date picker wrappers to exist.');
    }
    await user.click(within(startedTrigger).getByRole('button', { name: 'Clear date' }));
    await user.click(within(completedTrigger).getByRole('button', { name: 'Clear date' }));
    await user.type(screen.getByLabelText('Season'), '0');
    await user.type(screen.getByLabelText('Episode'), '1');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'TV progress must use positive whole-number season and episode values.',
    );
  });

  it('offers the bounded rating choices and saves the selected rating', async () => {
    let requestBody: unknown;
    server.use(
      http.put('*/library/entries', async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ ...entry, rating: 10 });
      }),
    );
    const user = userEvent.setup();
    renderEditor();

    await user.click(screen.getByLabelText('Rating (1–10)'));
    expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual([
      'Not rated',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
    ]);
    await user.click(screen.getByRole('option', { name: '10' }));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(requestBody).toMatchObject({ rating: 10 }));
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
