/** Register model. */
export interface Register {

  /** User's email. */
  readonly email: string;

  /** User's password. */
  readonly password: string;

  /** User's first name. */
  readonly firstName: string | null;

  /** User's last name. */
  readonly lastName: string | null;

  /** User username. */
  readonly username: string | null;

  // /** User's phone number. */
  // readonly phone: string | null;

  // /** User gender. */
  // readonly gender: string | null;
}
