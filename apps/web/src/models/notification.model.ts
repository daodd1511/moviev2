export type NotificationEventType = 'release';
export type NotificationMediaType = 'movie' | 'tv';
export type NotificationChannel = 'in_app';

export interface Notification {
  readonly id: string;
  readonly eventType: NotificationEventType;
  readonly mediaType: NotificationMediaType;
  readonly tmdbId: number;
  readonly title: string;
  readonly channel: NotificationChannel;
  readonly scheduledAt: string | null;
  readonly deliveredAt: string | null;
  readonly readAt: string | null;
  readonly createdAt: string;
}

export interface NotificationFilters {
  readonly unreadOnly?: boolean;
}

export interface NotificationEventPreferences {
  readonly release: boolean;
}

export interface NotificationPreferences {
  readonly timezone: string;
  readonly events: NotificationEventPreferences;
}

export type NotificationPreferencesInput = Partial<{
  readonly timezone: string;
  readonly events: Partial<NotificationEventPreferences>;
}>;
