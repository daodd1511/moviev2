import NotificationService from '../service/notificationService.js';

const toNotificationDto = notification => ({
  id: notification._id.toString(),
  eventType: notification.eventType,
  mediaType: notification.mediaType,
  tmdbId: notification.tmdbId,
  collectionId: notification.collectionId === null ? null : notification.collectionId.toString(),
  title: notification.title,
  channel: notification.channel,
  scheduledAt: notification.scheduledAt,
  deliveredAt: notification.deliveredAt,
  readAt: notification.readAt,
  createdAt: notification.createdAt,
});

const toPreferencesDto = preference => ({
  timezone: preference.timezone,
  events: preference.events,
});

const list = async (req, res) => {
  const notifications = await NotificationService.list(req.userId, req.query);
  res.status(200).json({ notifications: notifications.map(toNotificationDto) });
};

const markRead = async (req, res) => {
  const notification = await NotificationService.markRead(req.userId, req.params.id);
  if (!notification) {
    res.status(404).json({ message: 'Notification not found.' });
    return;
  }
  res.status(200).json(toNotificationDto(notification));
};

const getPreferences = async (req, res) => {
  res.status(200).json(toPreferencesDto(await NotificationService.getPreferences(req.userId)));
};

const updatePreferences = async (req, res) => {
  res
    .status(200)
    .json(toPreferencesDto(await NotificationService.updatePreferences(req.userId, req.body)));
};

const NotificationController = { list, markRead, getPreferences, updatePreferences };

export default NotificationController;
