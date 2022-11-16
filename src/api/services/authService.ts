import { backendApi } from '..';
import { LoginDto } from '../dtos/auth/login.dto';
import { LoginMapper } from '../mappers/auth/login.mapper';

export namespace AuthService {
  export const login = async(username: string, password: string): Promise<{ accessToken: string; id: string; }> => {
    const userLoginDto: LoginDto = LoginMapper.toDto({ username, password });
    const { data } = await backendApi.post<{ accessToken: string; id: string; }>('auth/login', userLoginDto);
    return data;
  };
}
