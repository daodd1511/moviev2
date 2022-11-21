/** Login model. */
export interface Login {

  /** Username. */
  readonly username: string;

  /** Password. */
  readonly password: string;
}

/** Login response model. */
export interface LoginResponse {

  /** Token. */
  readonly accessToken: string;

  /** User id. */
  readonly userId: string;
}
