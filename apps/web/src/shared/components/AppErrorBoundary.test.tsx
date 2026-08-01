import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppErrorBoundary } from './AppErrorBoundary';

const Bomb = () => {
  throw new Error('boom');
};

describe('AppErrorBoundary', () => {
  beforeEach(() => {
    // React logs caught render errors to console.error; this test intentionally
    // triggers one, so silence it rather than treat it as test noise.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <AppErrorBoundary>
        <p>content</p>
      </AppErrorBoundary>,
    );

    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('renders a safe fallback instead of crashing the page', () => {
    render(
      <AppErrorBoundary>
        <Bomb />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole('heading', { name: /unexpected error/i })).toBeInTheDocument();
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('invokes the reload callback when the retry button is clicked', async () => {
    const onReload = vi.fn();
    const user = userEvent.setup();
    render(
      <AppErrorBoundary onReload={onReload}>
        <Bomb />
      </AppErrorBoundary>,
    );

    await user.click(screen.getByRole('button', { name: /reload page/i }));

    expect(onReload).toHaveBeenCalledOnce();
  });
});
