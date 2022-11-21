import { z } from 'zod';

import { FORM_ERROR_MESSAGES } from '@/shared/constants/formErrorMessages';

export const loginSchema = z.object({
  username: z.string().min(1, { message: FORM_ERROR_MESSAGES.required })
    .max(255, { message: FORM_ERROR_MESSAGES.max }),
  password: z.string().min(6, { message: FORM_ERROR_MESSAGES.tooShort })
    .max(255, { message: FORM_ERROR_MESSAGES.max }),
});
