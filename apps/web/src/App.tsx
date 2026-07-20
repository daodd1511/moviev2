import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import { useAtom } from 'jotai';
import 'react-toastify/dist/ReactToastify.css';

import { Router } from './routes/Router';
import { TokenService } from './api/services/tokenService';
import { isAuthAtom } from './stores/atoms/authAtoms';
import { Loader } from './shared/components';

const queryClient = new QueryClient();

export const App = () => {
  const [, setIsAuth] = useAtom(isAuthAtom);
  if (TokenService.get() !== null) {
    setIsAuth(true);
  }
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <ToastContainer />
      <HashRouter>
        <Suspense fallback={<Loader className="h-screen"/>}>
          <Router />
        </Suspense>
      </HashRouter>
    </QueryClientProvider>
  );
};
