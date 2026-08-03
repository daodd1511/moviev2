import { optionalAuth, verifyToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import SocialController from '../controller/social.controller.js';
import {
  collectionIdParamsSchema,
  discoverCollectionsQuerySchema,
  usernameParamsSchema,
} from '../validation/social.schema.js';
import { createRouter } from './create-router.js';

const socialRouter = createRouter();

socialRouter.get(
  '/collections',
  validate({ query: discoverCollectionsQuerySchema }),
  SocialController.discoverCollections,
);
socialRouter.post(
  '/collections/:id/like',
  verifyToken,
  validate({ params: collectionIdParamsSchema }),
  SocialController.like,
);
socialRouter.delete(
  '/collections/:id/like',
  verifyToken,
  validate({ params: collectionIdParamsSchema }),
  SocialController.unlike,
);

socialRouter.get(
  '/profile/:username',
  optionalAuth,
  validate({ params: usernameParamsSchema }),
  SocialController.getProfile,
);
socialRouter.get(
  '/profile/:username/followers',
  validate({ params: usernameParamsSchema }),
  SocialController.listFollowers,
);
socialRouter.get(
  '/profile/:username/following',
  validate({ params: usernameParamsSchema }),
  SocialController.listFollowing,
);
socialRouter.post(
  '/follow/:username',
  verifyToken,
  validate({ params: usernameParamsSchema }),
  SocialController.follow,
);
socialRouter.delete(
  '/follow/:username',
  verifyToken,
  validate({ params: usernameParamsSchema }),
  SocialController.unfollow,
);

export default socialRouter;
