import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { Filter } from '.';
import { MediaType } from '@/shared/enums/mediaType';
it('renders accessible filter controls', () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <Provider>
        <MemoryRouter>
          <Filter type={MediaType.Movie} />
        </MemoryRouter>
      </Provider>
    </QueryClientProvider>,
  );
  expect(screen.getByRole('region', { name: 'Browse filters' })).toBeInTheDocument();
  expect(screen.getByText('Sort by')).toBeInTheDocument();
});
