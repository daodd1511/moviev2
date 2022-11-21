
import { backendApi } from '..';
import { LoginDto, LoginResponseDto } from '../dtos/auth/login.dto';
import { LoginMapper } from '../mappers/auth/login.mapper';
import { RegisterMapper } from '../mappers/auth/register.mapper';

import { TokenService } from './tokenService';

import { Login, LoginResponse, Register } from '@/models/auth';

export namespace AuthService {
  export const login = async(loginCredential: Login): Promise<LoginResponse> => {
    const userLoginDto: LoginDto = LoginMapper.toDto(loginCredential);
    const { data } = await backendApi.post<LoginResponseDto>('auth/login', userLoginDto);
    return LoginMapper.fromDto(data);
  };

  export const register = async(registerCredential: Register): Promise<void> => {
    const userRegisterDto = RegisterMapper.toDto(registerCredential);
    const { data } = await backendApi.post('auth/register', userRegisterDto);
    console.log(data);
  };

  // eslint-disable-next-line require-await
  export const logout = async(): Promise<void> => {
    TokenService.destroy();
  };
}
