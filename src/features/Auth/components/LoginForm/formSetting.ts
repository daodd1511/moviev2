import { z } from 'zod';

/** Form values. */
export interface FormValues {

  /** Username. */
  readonly username: string;

  /** Password. */
  readonly password: string;
}

export const loginSchema = z.object({
  username: z.string().min(1, { message: 'This field is required!' })
    .max(255, { message: 'This field is too long!' }),
  password: z.string().min(6, { message: 'This field is required as least 6 characters!' })
    .max(255, { message: 'This field is too long!' }),
});
