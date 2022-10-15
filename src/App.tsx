import { Suspense } from 'react';
import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Router } from './routes/Router';

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <HashRouter>
      <div>
        <Suspense
          fallback={<div>Brrr... here should be your loader component</div>}
        >
          <Router />
        </Suspense>
      </div>
    </HashRouter>
  </QueryClientProvider>
);
