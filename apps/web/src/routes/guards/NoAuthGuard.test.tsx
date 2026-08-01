import { Provider as JotaiProvider } from 'jotai';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NoAuthGuard } from './NoAuthGuard';

import { isAuthAtom } from '@/stores/atoms/authAtoms';

const renderGuard = (isAuth: boolean) => {
  const router = createMemoryRouter(
    [
      {
        element: <NoAuthGuard />,
        children: [{ path: 'auth/login', element: <p>Login page</p> }],
      },
      { path: '/', element: <p>Home page</p> },
    ],
    { initialEntries: ['/auth/login'] },
  );

  return render(
    <JotaiProvider initialValues={[[isAuthAtom, isAuth]]}>
      <RouterProvider router={router} />
    </JotaiProvider>,
  );
};

describe('NoAuthGuard', () => {
  it('renders the anonymous route when not authenticated', () => {
    renderGuard(false);

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('redirects home when already authenticated', () => {
    renderGuard(true);

    expect(screen.getByText('Home page')).toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });
});
