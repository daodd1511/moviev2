import { RegisterForm } from '../components/RegisterForm/RegisterForm';
import { AuthShell } from '../components/AuthShell';

export const RegisterPage = () => (
  <AuthShell
    kicker="Join Flix"
    title="Build your watchlist"
    description="Create an account to collect movies and shows, shape your own library, and never lose a title worth watching."
  >
    <RegisterForm />
  </AuthShell>
);
