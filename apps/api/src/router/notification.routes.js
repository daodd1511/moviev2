import { verifyToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import NotificationController from '../controller/notification.controller.js';
import {
  notificationIdParamsSchema,
  notificationListQuerySchema,
  updateNotificationPreferencesSchema,
} from '../validation/notification.schema.js';
import { createRouter } from './create-router.js';

const notificationRouter = createRouter();

notificationRouter.use(verifyToken);
notificationRouter.get(
  '/',
  validate({ query: notificationListQuerySchema }),
  NotificationController.list,
);
notificationRouter.get('/preferences', NotificationController.getPreferences);
notificationRouter.put(
  '/preferences',
  validate({ body: updateNotificationPreferencesSchema }),
  NotificationController.updatePreferences,
);
notificationRouter.post(
  '/:id/read',
  validate({ params: notificationIdParamsSchema }),
  NotificationController.markRead,
);

export default notificationRouter;
