import { useMutation } from '@tanstack/react-query';
import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';

import { ErrorField } from '../ErrorField';

import { FormValues, registerSchema } from './formSetting';

import { AuthService } from '@/api/services/authService';
import { ThreeDots } from '@/shared/components/styles';
import { Register } from '@/models/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    mutationFn: (credential: Register) => AuthService.register(credential),

    onSuccess() {
      navigate('/auth/login');
    },
    onError(error: unknown) {
      const message = isAxiosError<string>(error) ? error.response?.data : undefined;
      toast.error(message ?? 'Unable to create account');
    },
  });

  const onSubmit = handleSubmit(registerData => {
    mutation.mutate({
      email: registerData.email,
      password: registerData.password,
      username: registerData.username,
      firstName: null,
      lastName: null,
    });
  });
  return (
    <form
      className="w-full rounded-lg border border-foreground/10 bg-surface/65 p-6 shadow-[0_28px_70px_-32px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:p-9"
      onSubmit={event => void onSubmit(event)}
    >
      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
          Start your library
        </p>
        <h2 className="text-3xl font-light text-foreground sm:text-4xl">Create account</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          One account for every movie and show you want to remember.
        </p>
      </div>
      <div className="space-y-5">
        <div>
          <Label htmlFor="register-email" className="mb-1.5">
            Email
          </Label>
          <Input
            id="register-email"
            type="email"
            placeholder="johndoe@gmail.com"
            className="h-14 text-base"
            aria-invalid={errors.email?.message !== undefined}
            {...register('email')}
          />
          {errors.email?.message !== undefined && <ErrorField error={errors.email?.message} />}
        </div>
        <div>
          <Label htmlFor="register-username" className="mb-1.5">
            Username
          </Label>
          <Input
            id="register-username"
            type="text"
            placeholder="Enter your username"
            className="h-14 text-base"
            aria-invalid={errors.username?.message !== undefined}
            {...register('username')}
          />
          {errors.username?.message !== undefined && (
            <ErrorField error={errors.username?.message} />
          )}
        </div>
        <div>
          <Label htmlFor="register-password" className="mb-1.5">
            Password
          </Label>
          <Input
            id="register-password"
            type="password"
            placeholder="Enter your password"
            className="h-14 text-base"
            aria-invalid={errors.password?.message !== undefined}
            {...register('password')}
          />
          {errors.password?.message !== undefined && (
            <ErrorField error={errors.password?.message} />
          )}
        </div>
        <div>
          <Label htmlFor="register-confirm-password" className="mb-1.5">
            Confirm Password
          </Label>
          <Input
            id="register-confirm-password"
            type="password"
            placeholder="Confirm your password"
            className="h-14 text-base"
            aria-invalid={errors.confirmPassword?.message !== undefined}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword?.message !== undefined && (
            <ErrorField error={errors.confirmPassword?.message} />
          )}
        </div>
        <div>
          <Button
            disabled={mutation.isPending}
            type="submit"
            className="h-14 w-full rounded-full text-base font-semibold shadow-[0_12px_30px_-10px_rgba(245,165,36,0.55)]"
          >
            {mutation.isPending ? <ThreeDots /> : 'Sign Up'}
          </Button>
        </div>
        <div className="border-t border-foreground/10 pt-5 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-medium text-foreground hover:text-primary">
            Sign in
          </Link>
        </div>
      </div>
    </form>
  );
};

export const RegisterForm = memo(RegisterFormComponent);
