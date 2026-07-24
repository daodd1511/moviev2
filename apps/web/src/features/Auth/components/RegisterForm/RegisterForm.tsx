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
import { TextField } from '@/shared/components/ui/TextField';
import { Button } from '@/components/ui/button';

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
      className="mx-auto w-96 rounded-2xl bg-card p-12"
      onSubmit={onSubmit}
    >
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-foreground">Sign Up</h3>
        <p className="text-muted-foreground">Create your account.</p>
      </div>
      <div className="space-y-5">
        <div>
          <TextField
            label="Email"
            type="email"
            placeholder="johndoe@gmail.com"
            {...register('email')}
          />
          {errors.email?.message !== undefined && <ErrorField error={errors.email?.message}/>}
        </div>
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
          <TextField
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password."
            {...register('confirmPassword')}
          />
          {errors.confirmPassword?.message !== undefined && <ErrorField error={errors.confirmPassword?.message}/>}
        </div>
        <div>
          <Button disabled={mutation.isLoading} type="submit" className="w-full">
            {mutation.isLoading ? <ThreeDots /> : 'Sign Up'}
          </Button>
        </div>
        <div className="flex items-center justify-start">
          <div className="text-sm text-muted-foreground">
            Already have an account? <Link to="/auth/login" className="text-primary hover:underline">Sign In</Link>
          </div>
        </div>
      </div>
    </form>
  );
};

export const RegisterForm = memo(RegisterFormComponent);
