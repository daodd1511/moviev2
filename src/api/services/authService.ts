
import { backendApi } from '..';
import { LoginDto, LoginResponseDto } from '../dtos/auth/login.dto';
import { LoginMapper } from '../mappers/auth/login.mapper';

import { TokenService } from './tokenService';

import { LoginResponse } from '@/models/auth/login.model';

export namespace AuthService {
  export const login = async(username: string, password: string): Promise<LoginResponse> => {
    const userLoginDto: LoginDto = LoginMapper.toDto({ username, password });
    const { data } = await backendApi.post<LoginResponseDto>('auth/login', userLoginDto);
    return LoginMapper.fromDto(data);
  };

  // eslint-disable-next-line require-await
  export const logout = async(): Promise<void> => {
    TokenService.destroy();
  };
}
