import { LoginDto } from '../../dtos/auth/login.dto';

import { Login } from '@/models/auth/login.model';

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
}
