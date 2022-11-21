/** Register dto. */
export interface RegisterDto {

  /** User's email. */
  readonly email: string;

  /** User's password. */
  readonly password: string;

  /** User's first name. */
  readonly first_name: string | null;

  /** User's last name. */
  readonly last_name: string | null;

  // /** User's phone number. */
  // readonly phone: string | null;

  // /** User's gender. */
  // readonly gender: string | null;

  /** User's username. */
  readonly username: string | null;
}
