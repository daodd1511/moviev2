import { PropsWithChildren, ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

interface RenderAppOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Initial router location for this render. Defaults to `/`. */
  route?: string;
}

/**
 * Renders a component with its own QueryClient, Jotai store, and router, so tests never
 * leak state between each other through shared global instances.
 */
export const renderApp = (ui: ReactElement, { route = '/', ...options }: RenderAppOptions = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </JotaiProvider>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};
