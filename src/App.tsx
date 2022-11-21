import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { Router } from './routes/Router';

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    < ReactQueryDevtools initialIsOpen={false} />
    <HashRouter>
      <Suspense>
        <Router />
      </Suspense>
    </HashRouter>
  </QueryClientProvider>
);
