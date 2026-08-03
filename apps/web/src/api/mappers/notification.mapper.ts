import {
  notificationDtoSchema,
  notificationListDtoSchema,
  notificationPreferencesDtoSchema,
} from '../dtos/notification.dto';

import { Notification, NotificationPreferences } from '@/models/notification.model';

export namespace NotificationMapper {
  export const fromDto = (dto: unknown): Notification | null => {
    const result = notificationDtoSchema.safeParse(dto);
    if (result.success) return result.data;

    console.error('[NotificationMapper] Invalid Notification response.', result.error.issues);
    return null;
  };

  export const fromListDto = (dto: unknown): readonly Notification[] => {
    const result = notificationListDtoSchema.safeParse(dto);
    if (!result.success) {
      console.error(
        '[NotificationMapper] Invalid Notification list response.',
        result.error.issues,
      );
      return [];
    }
    return result.data.notifications;
  };

  export const fromPreferencesDto = (dto: unknown): NotificationPreferences | null => {
    const result = notificationPreferencesDtoSchema.safeParse(dto);
    if (result.success) return result.data;

    console.error(
      '[NotificationMapper] Invalid Notification preferences response.',
      result.error.issues,
    );
    return null;
  };
}
