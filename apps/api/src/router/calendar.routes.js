import { verifyToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import CalendarController from '../controller/calendar.controller.js';
import { calendarQuerySchema } from '../validation/calendar.schema.js';
import { createRouter } from './create-router.js';
const calendarRouter = createRouter();
calendarRouter.use(verifyToken);
calendarRouter.get('/', validate({ query: calendarQuerySchema }), CalendarController.list);
export default calendarRouter;
