import { z } from 'zod';

const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]+$/;

const optionalName = z.string().trim().min(1).max(60).nullable();

export const registerSchema = z
  .object({
    username: z.string().trim().min(3).max(30).regex(USERNAME_PATTERN),
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(8).max(128),
    first_name: optionalName,
    last_name: optionalName,
  })
  .strict();

export const loginSchema = z
  .object({
    username: z.string().trim().min(1).max(254),
    password: z.string().min(1).max(128),
  })
  .strict();
