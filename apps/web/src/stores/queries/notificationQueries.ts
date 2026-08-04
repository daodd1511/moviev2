import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { NotificationService } from '@/api/services/notificationService';
import { Notification, NotificationFilters } from '@/models/notification.model';

const notificationKeys = {
  all: ['notifications'] as const,
  list: (filters: NotificationFilters) => [...notificationKeys.all, 'list', filters] as const,
  preferences: ['notificationPreferences'] as const,
};

export namespace NotificationQueries {
  export const useList = (filters: NotificationFilters = {}) =>
    useQuery({
      queryKey: notificationKeys.list(filters),
      queryFn: () => NotificationService.list(filters),
    });

  export const usePreferences = () =>
    useQuery({
      queryKey: notificationKeys.preferences,
      queryFn: NotificationService.getPreferences,
    });

  export const useMarkRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: NotificationService.markRead,
      onSuccess(updated) {
        queryClient.setQueriesData<readonly Notification[]>(
          { queryKey: notificationKeys.all },
          notifications =>
            notifications?.map(notification =>
              notification.id === updated.id ? updated : notification,
            ),
        );
      },
    });
  };

  export const useUpdatePreferences = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: NotificationService.updatePreferences,
      onSuccess(preferences) {
        queryClient.setQueryData(notificationKeys.preferences, preferences);
      },
    });
  };
}
