import { useMutation } from '@tanstack/react-query';
import { memo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ErrorField } from '../ErrorField';

import { loginSchema } from './formSetting';

import { AuthService } from '@/api/services/authService';
import { TokenService } from '@/api/services/tokenService';
import { Login } from '@/models/auth/login.model';
import { isAuthAtom, tokenAtom } from '@/stores/atoms/authAtoms';
import { userIdAtom } from '@/stores/atoms/userAtoms';
import { TextField } from '@/shared/components/ui/TextField';
import { Button } from '@/components/ui/button';

const getSafeRedirectPath = (redirectPath: string | null): string =>
  redirectPath?.startsWith('/') === true && !redirectPath.startsWith('//') ? redirectPath : '/';

const LoginFormComponent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = getSafeRedirectPath(searchParams.get('redirect'));
  const [, setAuth] = useAtom(isAuthAtom);
  const [, setToken] = useAtom(tokenAtom);
  const [, setUserId] = useAtom(userIdAtom);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Login>({
    resolver: zodResolver(loginSchema),
  });
  const mutation = useMutation({
    mutationFn: ({ username, password }: Login) => AuthService.login({ username, password }),
    onSuccess(data) {
      TokenService.save(data.accessToken);
      setToken(data.accessToken);
      setUserId(data.userId);
      setAuth(true);
      navigate(redirectPath, { replace: true });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError(error: any) {
      toast.error(error.response?.data.message);
    },
  });

  const onSubmit = handleSubmit((loginData: Login) => {
    mutation.mutate(loginData);
  });
  return (
    <form
      className="w-full rounded-lg border border-foreground/10 bg-surface/65 p-6 shadow-[0_28px_70px_-32px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:p-9"
      onSubmit={onSubmit}
    >
      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
          Your account
        </p>
        <h2 className="text-3xl font-light text-foreground sm:text-4xl">Sign in</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Welcome back. Your next watch is waiting.
        </p>
      </div>
      <div className="space-y-6">
        <div>
          <TextField
            label="Username"
            type="text"
            placeholder="Enter your username"
            className="h-14 border-foreground/15 bg-foreground/[0.06] px-4 text-base shadow-[inset_0_1px_0_rgba(217,231,238,0.04)]"
            {...register('username')}
          />
          {errors.username?.message !== undefined && (
            <ErrorField error={errors.username?.message} />
          )}
        </div>
        <div>
          <TextField
            label="Password"
            type="password"
            placeholder="Enter your password"
            className="h-14 border-foreground/15 bg-foreground/[0.06] px-4 text-base shadow-[inset_0_1px_0_rgba(217,231,238,0.04)]"
            {...register('password')}
          />
          {errors.password?.message !== undefined && (
            <ErrorField error={errors.password?.message} />
          )}
        </div>
        <div>
          <Button
            type="submit"
            className="h-14 w-full rounded-full text-base font-semibold shadow-[0_12px_30px_-10px_rgba(245,165,36,0.55)]"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? 'Signing In' : 'Sign In'}
          </Button>
        </div>
        <div className="border-t border-foreground/10 pt-5 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link to="/auth/register" className="font-medium text-foreground hover:text-primary">
            Create one
          </Link>
        </div>
      </div>
    </form>
  );
};

export const LoginForm = memo(LoginFormComponent);
