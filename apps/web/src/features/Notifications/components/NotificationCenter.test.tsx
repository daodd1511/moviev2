import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { NotificationCenter } from './NotificationCenter';
import { server } from '@/test/server';

const renderCenter = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <NotificationCenter />
    </QueryClientProvider>,
  );

const notification = {
  id: '1',
  eventType: 'release' as const,
  mediaType: 'movie' as const,
  tmdbId: 1,
  collectionId: null,
  title: 'Tracked Movie',
  channel: 'in_app' as const,
  scheduledAt: '2026-02-01T00:00:00.000Z',
  deliveredAt: '2026-02-01T00:00:00.000Z',
  readAt: null,
  createdAt: '2026-02-01T00:00:00.000Z',
};

describe('NotificationCenter', () => {
  it('shows an empty state when there are no notifications', async () => {
    server.use(
      http.get('*/notifications', () => HttpResponse.json({ notifications: [] })),
      http.get('*/notifications/preferences', () =>
        HttpResponse.json({ timezone: 'UTC', events: { release: true } }),
      ),
    );
    const user = userEvent.setup();
    renderCenter();
    await user.click(screen.getByRole('button', { name: 'Notifications, no unread' }));
    expect(await screen.findByText('No notifications yet.')).toBeInTheDocument();
  });

  it('shows an unread indicator, marks a notification read, and does not duplicate rows', async () => {
    server.use(
      http.get('*/notifications', () => HttpResponse.json({ notifications: [notification] })),
      http.get('*/notifications/preferences', () =>
        HttpResponse.json({ timezone: 'UTC', events: { release: true } }),
      ),
      http.post('*/notifications/:id/read', () =>
        HttpResponse.json({ ...notification, readAt: '2026-02-02T00:00:00.000Z' }),
      ),
    );
    const user = userEvent.setup();
    renderCenter();
    expect(await screen.findByTestId('unread-indicator')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Notifications, 1 unread' }));
    const rows = await screen.findAllByText('Tracked Movie');
    expect(rows).toHaveLength(1);

    await user.click(rows[0]);
    expect(screen.queryByTestId('unread-indicator')).not.toBeInTheDocument();
  });

  it('toggles release-event preferences', async () => {
    server.use(
      http.get('*/notifications', () => HttpResponse.json({ notifications: [] })),
      http.get('*/notifications/preferences', () =>
        HttpResponse.json({ timezone: 'UTC', events: { release: true } }),
      ),
      http.put('*/notifications/preferences', () =>
        HttpResponse.json({ timezone: 'UTC', events: { release: false } }),
      ),
    );
    const user = userEvent.setup();
    renderCenter();
    await user.click(screen.getByRole('button', { name: 'Notifications, no unread' }));
    const toggle = await screen.findByRole('menuitemcheckbox', { name: 'Release alerts' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    await user.click(toggle);
    expect(await screen.findByRole('menuitemcheckbox', { name: 'Release alerts' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });
});
