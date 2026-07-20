import { RegisterDto } from '../../dtos/auth/register.dto';

import { Register } from '@/models/auth/register.model';

export namespace RegisterMapper {

  /**
   * Maps model to DTO.
   * @param credential User register credential.
   */
  export function toDto(credential: Register): RegisterDto {
    return {
      email: credential.email,
      first_name: credential.firstName,
      last_name: credential.lastName,
      password: credential.password,
      username: credential.username,

      // phone: credential.phone,
      // gender: credential.gender,
    };
  }
}
