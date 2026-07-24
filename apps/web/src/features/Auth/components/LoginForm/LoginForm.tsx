import { useMutation } from '@tanstack/react-query';
import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const LoginFormComponent = () => {
  const navigate = useNavigate();
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
    mutationFn: ({ username, password }: Login) =>
      AuthService.login({ username, password }),
    onSuccess(data) {
      TokenService.save(data.accessToken);
      setToken(data.accessToken);
      setUserId(data.userId);
      setAuth(true);
      navigate('/');
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
      className="mx-auto w-96 rounded-2xl bg-card p-12"
      onSubmit={onSubmit}
    >
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-foreground">Sign In</h3>
        <p className="text-muted-foreground">Please sign in to your account.</p>
      </div>
      <div className="space-y-5">
        <div>
          <TextField
            label="Username"
            type="text"
            placeholder="Enter your username"
            {...register('username')}
          />
          {errors.username?.message !== undefined && <ErrorField error={errors.username?.message}/>}
        </div>
        <div>
          <TextField
            label="Password"
            type="password"
            placeholder="Enter your password."
            {...register('password')}
          />
          {errors.password?.message !== undefined && <ErrorField error={errors.password?.message}/>}
        </div>
        <div>
          <Button type="submit" className="w-full" disabled={mutation.isLoading}>
            {mutation.isLoading ? 'Signing In' : 'Sign In'}
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm text-muted-foreground">
            Don&apos;t have an account yet? <Link to="/auth/register" className="text-primary hover:underline">Sign Up</Link>
          </div>
          <div className="text-sm">
            <a href="#" className="text-primary hover:underline">
              Forgot password?
            </a>
          </div>
        </div>
      </div>
    </form>
  );
};

export const LoginForm = memo(LoginFormComponent);
