import { LoginForm } from '../components/LoginForm/LoginForm';

export const LoginPage = () => (
  <div>
    <div className="relative bg-cover bg-center bg-no-repeat">
      <div className="mx-0 sm:min-h-screen justify-center sm:flex sm:flex-row">
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
          <LoginForm />
        </div>
      </div>
    </div>
  </div>
);
