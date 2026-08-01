import rateLimit from 'express-rate-limit';
import AuthController from '../controller/auth.controller.js';
import { checkDuplicateUsernameOrEmail } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { loginSchema, registerSchema } from '../validation/auth.schema.js';
import { AppError } from '../errors/app-error.js';
import { createRouter } from './create-router.js';

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      new AppError({
        status: 429,
        code: 'rate_limited',
        message: 'Too many requests. Please try again later.',
      }),
    );
  },
});

const authRouter = createRouter();
authRouter.use(authRateLimit);

authRouter.post(
  '/register',
  validate({ body: registerSchema }),
  checkDuplicateUsernameOrEmail,
  AuthController.register,
);

authRouter.post('/login', validate({ body: loginSchema }), AuthController.login);

export default authRouter;
