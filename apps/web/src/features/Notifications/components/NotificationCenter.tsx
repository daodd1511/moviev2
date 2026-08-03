import { Bell } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Notification } from '@/models/notification.model';
import { NotificationQueries } from '@/stores/queries/notificationQueries';

const NotificationRow = ({
  notification,
  onMarkRead,
}: {
  readonly notification: Notification;
  readonly onMarkRead: (id: string) => void;
}) => (
  <DropdownMenuItem
    onSelect={event => {
      event.preventDefault();
      if (notification.readAt === null) onMarkRead(notification.id);
    }}
    className="flex flex-col items-start gap-0.5"
  >
    <span className={notification.readAt === null ? 'font-semibold' : undefined}>
      {notification.title}
    </span>
    <span className="text-xs text-muted-foreground">
      {notification.scheduledAt === null
        ? 'Release date unknown'
        : new Date(notification.scheduledAt).toLocaleDateString()}
    </span>
  </DropdownMenuItem>
);

export const NotificationCenter = () => {
  const { data: notifications = [] } = NotificationQueries.useList();
  const { data: preferences } = NotificationQueries.usePreferences();
  const markRead = NotificationQueries.useMarkRead();
  const updatePreferences = NotificationQueries.useUpdatePreferences();
  const unreadCount = notifications.filter(notification => notification.readAt === null).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={
          unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications, no unread'
        }
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            data-testid="unread-indicator"
            className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary"
          />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        {notifications.length === 0 && (
          <div className="px-2 py-4 text-sm text-muted-foreground">No notifications yet.</div>
        )}
        {notifications.map(notification => (
          <NotificationRow
            key={notification.id}
            notification={notification}
            onMarkRead={id => markRead.mutate(id)}
          />
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={preferences?.events.release ?? true}
          onCheckedChange={checked => updatePreferences.mutate({ events: { release: checked } })}
          onSelect={event => event.preventDefault()}
        >
          Release alerts
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
