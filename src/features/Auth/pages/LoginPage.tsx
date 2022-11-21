/* eslint-disable max-lines-per-function */
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { toast } from 'react-toastify';

import { AuthService } from '@/api/services/authService';
import { Login } from '@/models/auth/login.model';
import { TokenService } from '@/api/services/tokenService';
import { isAuthAtom } from '@/stores/authStore';

interface FormValues {

  /** Username. */
  readonly username: string;

  /** Password. */
  readonly password: string;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const [, setAuth] = useAtom(isAuthAtom);
  const {
    register,
    handleSubmit,

    // formState: { errors },
  } = useForm<FormValues>();
  const mutation = useMutation({
    mutationFn: ({ username, password }: Login) =>
      AuthService.login(username, password),
    async onSuccess(data) {
      TokenService.save(data.accessToken);
      setAuth(true);
      await toast.promise;
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
    <div>
      <div className="relative bg-cover bg-center bg-no-repeat">
        <div className="mx-0 min-h-screen justify-center sm:flex sm:flex-row">
          <div className="z-10 flex  flex-col self-center p-10 sm:max-w-5xl  xl:max-w-2xl">
            <div className="hidden flex-col self-start text-black  xl:flex">
              <img src="" className="mb-3" />
              <h1 className="mb-3 text-5xl font-bold">Hi! Welcome Back </h1>
              <p className="pr-3">
                Lorem ipsum is placeholder text commonly used in the graphic,
                print, and publishing industries for previewing layouts and
                visual mockups
              </p>
            </div>
          </div>
          <div className="z-10 flex justify-center self-center rounded-xl border border-green-400">
            <form
              className="w-100 mx-auto rounded-2xl bg-white p-12 "
              onSubmit={onSubmit}
            >
              <div className="mb-4">
                <h3 className="text-2xl font-semibold text-gray-800">
                  Sign In
                </h3>
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
                    autoComplete="username"
                    {...register('username', { required: true })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="mb-5 text-sm font-medium tracking-wide text-gray-700">
                    Password
                  </label>
                  <input
                    className="w-full content-center rounded-lg border border-gray-300 px-4  py-2 text-base focus:border-green-400 focus:outline-none"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password."
                    {...register('password', { required: true })}
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="flex w-full cursor-pointer justify-center  rounded-full bg-green-400 p-3  font-semibold tracking-wide text-gray-100  shadow-lg transition duration-500 ease-in hover:bg-green-500"
                  >
                    {mutation.isLoading ? 'Singing in...' : 'Sign In'}
                  </button>
                </div>
                <div className="flex items-center justify-start">
                  <div className="text-sm">
                    <a href="#" className="text-green-400 hover:text-green-500">
                      Forgot your password?
                    </a>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
