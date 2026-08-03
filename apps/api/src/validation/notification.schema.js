import { z } from 'zod';

export const notificationListQuerySchema = z
  .object({ unreadOnly: z.enum(['true', 'false']).optional() })
  .strict();

export const notificationIdParamsSchema = z.object({ id: z.string().trim().min(1) }).strict();

export const updateNotificationPreferencesSchema = z
  .object({
    timezone: z.string().trim().min(1).max(100).optional(),
    events: z.object({ release: z.boolean() }).strict().partial().optional(),
  })
  .strict();
