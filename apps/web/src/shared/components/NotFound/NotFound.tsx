import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export const NotFound = () => (
  <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Error 404</p>
    <h1 className="mt-4 text-6xl font-extralight uppercase tracking-wide text-foreground md:text-8xl">
      Not Found
    </h1>
    <p className="mt-4 max-w-md text-muted-foreground">
      Looks like you&apos;re lost — the page you&apos;re looking for doesn&apos;t exist.
    </p>
    <Button asChild className="mt-8">
      <Link to="/">Go to Home</Link>
    </Button>
  </main>
);
