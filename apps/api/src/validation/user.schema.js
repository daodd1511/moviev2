import { z } from 'zod';

const optionalName = z.string().trim().min(1).max(60).nullable().optional();

// Only the profile fields already stored by the User model. No password, username,
// email, or id/target-user fields — identity is derived from the auth token, never
// the request body.
export const updateProfileSchema = z
  .object({
    first_name: optionalName,
    last_name: optionalName,
    phone: z.number().int().positive().nullable().optional(),
    gender: z.string().trim().min(1).max(30).nullable().optional(),
  })
  .strict();
