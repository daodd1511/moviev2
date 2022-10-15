import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';

import { Router } from './routes/Router';
import { Spinner } from './shared/components/Spinner/Spinner';

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <HashRouter>
      <Suspense fallback={<Spinner />}>
        <Router />
      </Suspense>
    </HashRouter>
  </QueryClientProvider>
);
