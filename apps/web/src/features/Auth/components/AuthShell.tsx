import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const BACKDROP_URL = 'https://image.tmdb.org/t/p/original/pbrkL804c8yAv3zBZR4QPEafpAR.jpg';

interface Props {
  /** Small image-panel label. */
  readonly kicker: string;

  /** Image-panel headline. */
  readonly title: string;

  /** Image-panel supporting copy. */
  readonly description: string;

  /** Authentication form. */
  readonly children: ReactNode;
}

export const AuthShell = ({ kicker, title, description, children }: Props) => (
  <main className="grid min-h-svh bg-background lg:grid-cols-2">
    <section className="relative hidden min-h-svh overflow-hidden lg:block" aria-label="Flix">
      <img src={BACKDROP_URL} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/10 via-transparent to-background/80" />

      <Link
        to="/"
        className="absolute top-8 left-10 z-2 text-2xl font-semibold tracking-wide text-foreground xl:top-10 xl:left-14"
      >
        Flix<span className="text-primary">.</span>
      </Link>

      <div className="absolute inset-x-0 bottom-0 z-2 p-10 xl:p-14">
        <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          {kicker}
        </p>
        <h1 className="max-w-xl text-[clamp(2.5rem,4vw,4.5rem)] leading-[1.04] font-extralight tracking-[0.015em] text-foreground uppercase">
          {title}
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-body">{description}</p>
      </div>
    </section>

    <section className="relative flex min-h-svh items-center justify-center overflow-y-auto px-5 py-20 sm:px-10 lg:px-12 xl:px-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(217,231,238,0.06),transparent_42%)]" />
      <Link
        to="/"
        className="absolute top-5 left-5 z-2 text-xl font-semibold tracking-wide text-foreground sm:top-7 sm:left-8 lg:hidden"
      >
        Flix<span className="text-primary">.</span>
      </Link>
      <div className="relative z-1 w-full max-w-[31rem]">{children}</div>
    </section>
  </main>
);
