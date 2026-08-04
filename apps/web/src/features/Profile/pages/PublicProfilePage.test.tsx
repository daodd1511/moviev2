import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { PublicProfilePage } from './PublicProfilePage';

import { isAuthAtom } from '@/stores/atoms/authAtoms';
import { server } from '@/test/server';

const profile = {
  username: 'riley',
  firstName: 'Riley',
  lastName: 'Chen',
  followerCount: 2,
  followingCount: 1,
  isFollowedByViewer: false,
};

const renderPage = (isAuthenticated: boolean, initialPath = '/u/riley') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <JotaiProvider initialValues={[[isAuthAtom, isAuthenticated]]}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/u/:username" element={<PublicProfilePage />} />
          </Routes>
        </MemoryRouter>
      </JotaiProvider>
    </QueryClientProvider>,
  );
};

describe('PublicProfilePage', () => {
  afterEach(() => server.resetHandlers());

  it('shows a 404 page for an unknown or private profile', async () => {
    server.use(http.get('*/social/profile/riley', () => HttpResponse.json({}, { status: 404 })));
    renderPage(false);

    expect(await screen.findByText(/not found/i)).toBeInTheDocument();
  });

  it('sends unauthenticated viewers to login instead of following', async () => {
    server.use(http.get('*/social/profile/riley', () => HttpResponse.json(profile)));
    renderPage(false);

    const link = await screen.findByRole('link', { name: 'Log in to follow @riley' });
    expect(link).toHaveAttribute('href', expect.stringContaining('/auth/login'));
  });

  it('follows and unfollows for an authenticated viewer, and expands the followers list', async () => {
    let followCalled = false;
    server.use(
      http.get('*/social/profile/riley', () => HttpResponse.json(profile)),
      http.get('*/user/profile', () =>
        HttpResponse.json({
          id: 'viewer-1',
          username: 'casey',
          social: { publicProfile: true, showFollowers: true, showFollowing: true },
        }),
      ),
      http.get('*/social/profile/riley/followers', () =>
        HttpResponse.json({ followers: ['alice', 'bob'] }),
      ),
      http.post('*/social/follow/riley', () => {
        followCalled = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderPage(true);

    await user.click(await screen.findByRole('button', { name: 'Follow' }));
    await waitFor(() => expect(followCalled).toBe(true));

    await user.click(screen.getByRole('button', { name: '2 Followers' }));
    expect(await screen.findByRole('link', { name: '@alice' })).toBeInTheDocument();
  });

  it('shows an empty state when a follower list has none to show', async () => {
    server.use(
      http.get('*/social/profile/riley', () => HttpResponse.json(profile)),
      http.get('*/user/profile', () =>
        HttpResponse.json({
          id: 'viewer-1',
          username: 'casey',
          social: { publicProfile: true, showFollowers: true, showFollowing: true },
        }),
      ),
      http.get('*/social/profile/riley/following', () => HttpResponse.json({ following: [] })),
    );
    const user = userEvent.setup();
    renderPage(true);

    await user.click(await screen.findByRole('button', { name: '1 Following' }));
    expect(await screen.findByText('No following to show.')).toBeInTheDocument();
  });
});
