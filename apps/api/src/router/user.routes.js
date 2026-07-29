import { verifyToken } from '../middleware/auth.middleware.js';
import UserController from '../controller/user.controller.js';
import ListController from '../controller/list.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateProfileSchema } from '../validation/user.schema.js';
import { createRouter } from './create-router.js';

const userRouter = createRouter();

userRouter.get('/profile', verifyToken, (req, res) => {
  UserController.getProfile(req, res);
});

userRouter.put('/profile', verifyToken, validate({ body: updateProfileSchema }), (req, res) => {
  UserController.updateProfile(req, res);
});

userRouter.get('/list/:username/:listId', (req, res) => {
  ListController.getListByUsername(req, res);
});

export default userRouter;
