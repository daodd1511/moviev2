import { backendApi } from '..';

import { NotificationMapper } from '../mappers/notification.mapper';

import {
  Notification,
  NotificationFilters,
  NotificationPreferences,
  NotificationPreferencesInput,
} from '@/models/notification.model';

export namespace NotificationService {
  export const list = async (
    filters: NotificationFilters = {},
  ): Promise<readonly Notification[]> => {
    const params = filters.unreadOnly === undefined ? {} : { unreadOnly: String(filters.unreadOnly) };
    const { data } = await backendApi.get<unknown>('/notifications', { params });
    return NotificationMapper.fromListDto(data);
  };

  export const markRead = async (id: string): Promise<Notification> => {
    const { data } = await backendApi.post<unknown>(`/notifications/${id}/read`);
    const notification = NotificationMapper.fromDto(data);
    if (notification === null) throw new Error('The Notification response was invalid.');
    return notification;
  };

  export const getPreferences = async (): Promise<NotificationPreferences> => {
    const { data } = await backendApi.get<unknown>('/notifications/preferences');
    const preferences = NotificationMapper.fromPreferencesDto(data);
    if (preferences === null) throw new Error('The Notification preferences response was invalid.');
    return preferences;
  };

  export const updatePreferences = async (
    input: NotificationPreferencesInput,
  ): Promise<NotificationPreferences> => {
    const { data } = await backendApi.put<unknown>('/notifications/preferences', input);
    const preferences = NotificationMapper.fromPreferencesDto(data);
    if (preferences === null) throw new Error('The Notification preferences response was invalid.');
    return preferences;
  };
}
