import { z } from 'zod';

import { FORM_ERROR_MESSAGES } from '@/shared/constants/formErrorMessages';
import { Register } from '@/models/auth';

/** Form values. */
export interface FormValues extends Register {

  /** Confirm password. */
  readonly confirmPassword: string;

}

export const registerSchema = z.object({
  username: z.string().min(1, { message: FORM_ERROR_MESSAGES.required })
    .max(255, { message: FORM_ERROR_MESSAGES.max }),
  password: z.string().min(6, { message: FORM_ERROR_MESSAGES.tooShort })
    .max(255, { message: FORM_ERROR_MESSAGES.max }),
  confirmPassword: z.string().min(6, { message: FORM_ERROR_MESSAGES.tooShort })
    .max(255, { message: FORM_ERROR_MESSAGES.max }),
  email: z.string().email({ message: FORM_ERROR_MESSAGES.email }),
}).refine(data => data.password === data.confirmPassword, {
  message: FORM_ERROR_MESSAGES.passwordNotMatch,
  path: ['confirmPassword'],
});
