/** Login dto. */
export interface LoginDto {

  /** Username. */
  username: string;

  /** Password. */
  password: string;
}

/** Login response dto. */
export interface LoginResponseDto {

  /** Token. */
  accessToken: string;

  /** User id. */
  id: string;
}
