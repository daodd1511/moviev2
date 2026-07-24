import { LoginForm } from '../components/LoginForm/LoginForm';
import { AuthShell } from '../components/AuthShell';

export const LoginPage = () => (
  <AuthShell
    kicker="Welcome back"
    title="Track everything you watch"
    description="Sign in to build lists, remember what you have seen, and keep every great recommendation close."
  >
    <LoginForm />
  </AuthShell>
);
