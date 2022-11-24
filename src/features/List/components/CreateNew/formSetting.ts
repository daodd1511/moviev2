import { z } from 'zod';

import { FORM_ERROR_MESSAGES } from '@/shared/constants/formErrorMessages';

export const listSchema = z.object({
  name: z.string().min(1, { message: FORM_ERROR_MESSAGES.required })
    .max(255, { message: FORM_ERROR_MESSAGES.max }),
  description: z.string(),
  movies: z.array(z.number()).default([]),
  tvShows: z.array(z.number()).default([]),
});
