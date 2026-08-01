import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginForm } from './LoginForm';

import { TokenService } from '@/api/services/tokenService';
import { renderApp } from '@/test/renderApp';
import { server } from '@/test/server';

const navigateMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const submitLogin = async (username: string, password: string) => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/username/i), username);
  await user.type(screen.getByLabelText(/password/i), password);
  await user.click(screen.getByRole('button', { name: /sign in/i }));
};

describe('LoginForm', () => {
  beforeEach(() => {
    TokenService.destroy();
  });

  afterEach(() => {
    navigateMock.mockClear();
  });

  it('logs in and navigates to a safe, previously-requested redirect path', async () => {
    server.use(
      http.post('*/auth/login', () =>
        HttpResponse.json({ id: 'user-1', accessToken: 'issued-token' }),
      ),
    );
    renderApp(<LoginForm />, { route: '/auth/login?redirect=%2Fuser%2Fprofile' });

    await submitLogin('someuser', 'password123');

    await waitFor(() => expect(TokenService.get()).toBe('issued-token'));
    expect(navigateMock).toHaveBeenCalledWith('/user/profile', { replace: true });
  });

  it('ignores a protocol-relative redirect target and falls back to home', async () => {
    server.use(
      http.post('*/auth/login', () =>
        HttpResponse.json({ id: 'user-1', accessToken: 'issued-token' }),
      ),
    );
    renderApp(<LoginForm />, { route: '/auth/login?redirect=%2F%2Fevil.com' });

    await submitLogin('someuser', 'password123');

    await waitFor(() => expect(navigateMock).toHaveBeenCalled());
    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
  });

  it('shows the API error envelope message on failed login', async () => {
    server.use(
      http.post('*/auth/login', () =>
        HttpResponse.json(
          {
            error: {
              code: 'invalid_credentials',
              message: 'Invalid username or password.',
              requestId: 'req-1',
            },
          },
          { status: 401 },
        ),
      ),
    );
    renderApp(<LoginForm />, { route: '/auth/login' });

    await submitLogin('someuser', 'wrongpass');

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid username or password.'),
    );
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('shows a fallback message when the failure has no error envelope', async () => {
    server.use(http.post('*/auth/login', () => HttpResponse.error()));
    renderApp(<LoginForm />, { route: '/auth/login' });

    await submitLogin('someuser', 'wrongpass');

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to sign in'));
  });
});
