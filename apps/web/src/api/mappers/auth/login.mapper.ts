import { LoginDto, LoginResponseDto } from '../../dtos/auth/login.dto';

import { Login, LoginResponse } from '@/models/auth/login.model';

export namespace LoginMapper {

  /**
   * Maps model to DTO.
   * @param credential User login credential.
   */
  export function toDto(credential: Login): LoginDto {
    return {
      username: credential.username,
      password: credential.password,
    };
  }

  /**
   * Maps dto to model.
   * @param response Login response.
   */
  export function fromDto(response: LoginResponseDto): LoginResponse {
    const result: LoginResponse = {
      accessToken: response.accessToken,
      userId: response.id,
    };
    return result;
  }
}
