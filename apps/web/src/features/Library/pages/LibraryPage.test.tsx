import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { LibraryPage } from './LibraryPage';

import { server } from '@/test/server';

const renderPage = (path: string) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <LibraryPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('LibraryPage', () => {
  afterEach(() => server.resetHandlers());

  it('restores URL filters in the accessible filter controls', async () => {
    server.use(http.get('*/library/entries', () => HttpResponse.json({ entries: [] })));
    renderPage('/user/library?state=planned&type=tv&rating=8&sort=lastWatchedAt');

    expect(await screen.findByRole('heading', { name: 'No matching titles' })).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toHaveValue('planned');
    expect(screen.getByLabelText('Type')).toHaveValue('tv');
    expect(screen.getByLabelText('Rating')).toHaveValue('8');
    expect(screen.getByLabelText('Sort')).toHaveValue('lastWatchedAt');
  });
});
