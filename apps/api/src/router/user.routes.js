import { verifyToken } from '../middleware/auth.middleware.js';
import UserController from '../controller/user.controller.js';
import ListController from '../controller/list.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateProfileSchema } from '../validation/user.schema.js';
import { publicListParamsSchema } from '../validation/list.schema.js';
import { createRouter } from './create-router.js';

const userRouter = createRouter();

userRouter.get('/profile', verifyToken, UserController.getProfile);
userRouter.put(
  '/profile',
  verifyToken,
  validate({ body: updateProfileSchema }),
  UserController.updateProfile,
);

userRouter.get(
  '/list/:username/:listId',
  validate({ params: publicListParamsSchema }),
  ListController.getListByUsername,
);

export default userRouter;
