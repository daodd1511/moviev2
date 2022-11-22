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
import { isAuthAtom } from '@/stores/authStore';

const LoginFormComponent = () => {
  const navigate = useNavigate();
  const [, setAuth] = useAtom(isAuthAtom);
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
      className="w-96 mx-auto rounded-2xl bg-white p-12 "
      onSubmit={onSubmit}
    >
      <div className="mb-4">
        <h3 className="text-2xl font-semibold text-gray-800">Sign In</h3>
        <p className="text-gray-500">Please sign in to your account.</p>
      </div>
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium tracking-wide text-gray-700">
            Username
          </label>
          <input
            className=" w-full rounded-lg border border-gray-300 px-4  py-2 text-base focus:border-green-400 focus:outline-none"
            type="text"
            placeholder="Enter your username"
            {...register('username')}
          />
          {errors.username?.message !== undefined && <ErrorField error={errors.username?.message}/>}
        </div>
        <div className="space-y-2 break-words">
          <label className="mb-5 text-sm font-medium tracking-wide text-gray-700">
            Password
          </label>
          <input
            className="w-full content-center rounded-lg border border-gray-300 px-4  py-2 text-base focus:border-green-400 focus:outline-none"
            type="password"
            placeholder="Enter your password."
            {...register('password')}
          />
          {errors.password?.message !== undefined && <ErrorField error={errors.password?.message}/>}
        </div>
        <div>
          <button
            type="submit"
            className={`btn flex w-full cursor-pointer justify-center  rounded-full bg-green-400 p-3  font-semibold tracking-wide text-gray-100  shadow-lg border-none hover:bg-green-500 ${mutation.isLoading ? 'loading' : ''}`}
          >
            {mutation.isLoading ? 'Signing In' : 'Sign In'}
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm">
          Don&apos;t have an account yet? <Link to="/auth/register" className="text-green-400 hover:text-green-500">Sign Up</Link>
          </div>
          <div className="text-sm">
            <a href="#" className="text-green-400 hover:text-green-500">
              Forgot password?
            </a>
          </div>

        </div>
      </div>
    </form>
  );
};

export const LoginForm = memo(LoginFormComponent);
