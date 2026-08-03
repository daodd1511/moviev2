import { z } from 'zod';

const nullableDateSchema = z.string().datetime().nullable();

export const notificationDtoSchema = z
  .object({
    id: z.string().min(1),
    eventType: z.literal('release'),
    mediaType: z.enum(['movie', 'tv']),
    tmdbId: z.number().int().positive(),
    title: z.string().min(1),
    channel: z.literal('in_app'),
    scheduledAt: nullableDateSchema,
    deliveredAt: nullableDateSchema,
    readAt: nullableDateSchema,
    createdAt: z.string().datetime(),
  })
  .strict();

export const notificationListDtoSchema = z.object({
  notifications: z.array(notificationDtoSchema),
});

export const notificationPreferencesDtoSchema = z
  .object({
    timezone: z.string().min(1),
    events: z.object({ release: z.boolean() }).strict(),
  })
  .strict();

export type NotificationDto = z.infer<typeof notificationDtoSchema>;
export type NotificationPreferencesDto = z.infer<typeof notificationPreferencesDtoSchema>;
