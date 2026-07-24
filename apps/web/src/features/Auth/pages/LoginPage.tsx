import { LoginForm } from '../components/LoginForm/LoginForm';

const BACKDROP_URL = 'https://image.tmdb.org/t/p/original/pbrkL804c8yAv3zBZR4QPEafpAR.jpg';

export const LoginPage = () => (
  <div className="flex min-h-screen flex-col sm:flex-row">
    <div className="relative hidden flex-1 overflow-hidden xl:block">
      <img src={BACKDROP_URL} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
      <div className="relative z-2 flex h-full flex-col justify-end p-12">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-primary">Welcome back</p>
        <h1 className="mb-3 max-w-md text-4xl font-extralight uppercase leading-tight text-foreground">
          Track everything you watch
        </h1>
        <p className="max-w-sm text-muted-foreground">
          Sign in to build lists, rate what you&apos;ve seen, and pick up where you left off.
        </p>
      </div>
    </div>
    <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
      <LoginForm />
    </div>
  </div>
);
