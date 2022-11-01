import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';

import { Router } from './routes/Router';
import { Navbar } from './shared/components';

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <HashRouter>
      <Navbar />
      <Suspense>
        <div className="m-auto max-w-screen-2xl">
          <Router />
        </div>
      </Suspense>
    </HashRouter>
  </QueryClientProvider>
);
