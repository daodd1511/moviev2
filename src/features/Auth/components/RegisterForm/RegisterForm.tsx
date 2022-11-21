/* eslint-disable max-lines-per-function */
import { useMutation } from '@tanstack/react-query';
import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ErrorField } from '../ErrorField';

import { FormValues, registerSchema } from './formSetting';

import { AuthService } from '@/api/services/authService';
import { ThreeDots } from '@/shared/components/styles';
import { Register } from '@/models/auth';

const RegisterFormComponent = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
  });
  const mutation = useMutation({
    mutationFn: (credential: Register) =>
      AuthService.register(credential),

    onSuccess() {
      navigate('/auth/login');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError(error: any) {
      toast.error(error.response.data);
    },
  });

  const onSubmit = handleSubmit((registerData: Register) => {
    mutation.mutate(registerData);
  });
  return (
    <form
      className="w-96 mx-auto rounded-2xl bg-white p-12 "
      onSubmit={onSubmit}
    >
      <div className="mb-4">
        <h3 className="text-2xl font-semibold text-gray-800">Sign Up</h3>
        <p className="text-gray-500">Create your account.</p>
      </div>
      <div className="space-y-5">
        <div className="space-y-2 break-words">
          <label className="mb-5 text-sm font-medium tracking-wide text-gray-700">
            Email
          </label>
          <input
            className="w-full content-center rounded-lg border border-gray-300 px-4  py-2 text-base focus:border-green-400 focus:outline-none"
            type="email"
            placeholder="johndoe@gmail.com"
            {...register('email')}
          />
          {errors.email?.message !== undefined && <ErrorField error={errors.email?.message}/>}
        </div>
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
        <div className="space-y-2 break-words">
          <label className="mb-5 text-sm font-medium tracking-wide text-gray-700">
            Confirm Password
          </label>
          <input
            className="w-full content-center rounded-lg border border-gray-300 px-4  py-2 text-base focus:border-green-400 focus:outline-none"
            type="password"
            placeholder="Confirm your password."
            {...register('confirmPassword')}
          />
          {errors.confirmPassword?.message !== undefined && <ErrorField error={errors.confirmPassword?.message}/>}
        </div>
        <div>
          <button
            disabled={mutation.isLoading}
            type="submit"
            className="flex w-full cursor-pointer justify-center  rounded-full bg-green-400 p-3  font-semibold tracking-wide text-gray-100  shadow-lg transition duration-500 ease-in hover:bg-green-500"
          >
            {mutation.isLoading ? <ThreeDots /> : 'Sign Up'}
          </button>
        </div>
        <div className="flex items-center justify-start">
          <div className="text-sm">
            <Link to="/auth/login" className="text-green-400 hover:text-green-500"> Already have an account? </Link>
          </div>
        </div>
      </div>
    </form>
  );
};

export const RegisterForm = memo(RegisterFormComponent);
