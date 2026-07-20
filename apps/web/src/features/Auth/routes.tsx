import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

export const Login = lazy(() =>
  import('./pages/LoginPage').then(module => ({
    default: module.LoginPage,
  })));

export const Register = lazy(() =>
  import('./pages/RegisterPage').then(module => ({
    default: module.RegisterPage,
  })));
export const authRoutes: RouteObject[] = [
  {
    path: 'login',
    element: <Login />,
  },
  {
    path: 'register',
    element: <Register />,
  },
];
