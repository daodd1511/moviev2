import { Provider as JotaiProvider } from 'jotai';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AuthGuard } from './AuthGuard';

import { isAuthAtom } from '@/stores/atoms/authAtoms';

const renderGuard = (isAuth: boolean, initialEntry = '/') => {
  const router = createMemoryRouter(
    [
      {
        element: <AuthGuard />,
        children: [{ path: '/', element: <p>Protected content</p> }],
      },
      { path: 'auth/login', element: <p>Login page</p> },
    ],
    { initialEntries: [initialEntry] },
  );

  const result = render(
    <JotaiProvider initialValues={[[isAuthAtom, isAuth]]}>
      <RouterProvider router={router} />
    </JotaiProvider>,
  );

  return { ...result, router };
};

describe('AuthGuard', () => {
  it('renders the protected route when authenticated', () => {
    renderGuard(true);

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    const { router } = renderGuard(false, '/?filter=recent');

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/auth/login');
    expect(router.state.location.search).toBe('?redirect=%2F%3Ffilter%3Drecent');
  });
});
