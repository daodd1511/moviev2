import { Provider as JotaiProvider } from 'jotai';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AuthGuard } from './AuthGuard';

import { isAuthAtom } from '@/stores/atoms/authAtoms';

const renderGuard = (isAuth: boolean) => {
  const router = createMemoryRouter(
    [
      {
        element: <AuthGuard />,
        children: [{ path: '/', element: <p>Protected content</p> }],
      },
      { path: 'auth/login', element: <p>Login page</p> },
    ],
    { initialEntries: ['/'] },
  );

  return render(
    <JotaiProvider initialValues={[[isAuthAtom, isAuth]]}>
      <RouterProvider router={router} />
    </JotaiProvider>,
  );
};

describe('AuthGuard', () => {
  it('renders the protected route when authenticated', () => {
    renderGuard(true);

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    renderGuard(false);

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });
});
