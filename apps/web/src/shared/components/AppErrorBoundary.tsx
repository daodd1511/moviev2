import { Component, ErrorInfo, ReactNode } from 'react';

import { reportError } from '../utils/reportError';

import { Button } from '@/components/ui/button';

interface Props {
  readonly children: ReactNode;
  /** Invoked by the reload button; defaults to a real page reload. Overridable so tests
   * don't have to stub `window.location.reload` — jsdom marks it non-configurable. */
  readonly onReload?: () => void;
}

interface State {
  readonly hasError: boolean;
}

/** Catches render errors anywhere below it and shows a safe retry/reload fallback instead
 * of a blank page. Reports the caught error through `reportError`. */
export class AppErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError(error, { componentStack: info.componentStack ?? undefined });
  }

  private readonly handleReload = (): void => {
    (this.props.onReload ?? (() => window.location.reload()))();
  };

  public render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Something went wrong
        </p>
        <h1 className="mt-4 text-4xl font-extralight tracking-wide text-foreground uppercase md:text-6xl">
          Unexpected error
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          We hit a snag loading this page. Reloading usually fixes it.
        </p>
        <Button type="button" className="mt-8" onClick={this.handleReload}>
          Reload page
        </Button>
      </main>
    );
  }
}
