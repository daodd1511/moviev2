import { RegisterForm } from '../components/RegisterForm/RegisterForm';

const BACKDROP_URL = 'https://image.tmdb.org/t/p/original/pbrkL804c8yAv3zBZR4QPEafpAR.jpg';

export const RegisterPage = () => (
  <div className="flex min-h-screen flex-col sm:flex-row">
    <div className="relative hidden flex-1 overflow-hidden xl:block">
      <img src={BACKDROP_URL} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
      <div className="relative z-2 flex h-full flex-col justify-end p-12">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-primary">Join Flix</p>
        <h1 className="mb-3 max-w-md text-4xl font-extralight uppercase leading-tight text-foreground">
          Build your watchlist
        </h1>
        <p className="max-w-sm text-muted-foreground">
          Create an account to save movies and shows, rate what you&apos;ve seen, and get picks worth your time.
        </p>
      </div>
    </div>
    <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
      <RegisterForm />
    </div>
  </div>
);
