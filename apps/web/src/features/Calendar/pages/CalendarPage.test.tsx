import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { CalendarPage } from './CalendarPage';
import { server } from '@/test/server';
describe('CalendarPage', () => {
  it('switches month and agenda views for tracked releases', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/calendar', () =>
        HttpResponse.json({
          releases: [
            {
              mediaType: 'movie',
              tmdbId: 1,
              title: 'Tracked',
              releaseDate: null,
              posterPath: null,
            },
          ],
        }),
      ),
    );
    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <CalendarPage />
      </QueryClientProvider>,
    );
    expect(await screen.findByText('Tracked')).toBeInTheDocument();
    expect(screen.getByText('Release date unknown')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Agenda' }));
    expect(screen.getByRole('tab', { name: 'Agenda', selected: true })).toBeInTheDocument();
  });
});
