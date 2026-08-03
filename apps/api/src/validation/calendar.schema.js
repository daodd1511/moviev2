import { z } from 'zod';
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const calendarQuerySchema = z
  .object({ from: date, to: date, timezone: z.string().trim().min(1).max(100).default('UTC') })
  .strict()
  .refine(input => input.from <= input.to, { path: ['from'], message: 'from must precede to.' });
