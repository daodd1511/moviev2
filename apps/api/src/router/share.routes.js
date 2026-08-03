import { z } from 'zod';

import { validate } from '../middleware/validate.middleware.js';
import ShareController from '../controller/share.controller.js';
import { mongoIdSchema } from '../validation/list.schema.js';
import { createRouter } from './create-router.js';

const shareCollectionParamsSchema = z
  .object({ username: z.string().trim().min(1).max(50), id: mongoIdSchema })
  .strict();

// Mounted at the app root (not under /api): its paths ARE the SPA's canonical share URLs
// (`/u/:username/collections/:id` and the legacy `/lists/:id` alias), so a reverse proxy
// can forward them here unchanged before falling back to the SPA for everything else.
// `:username` is accepted but not trusted for the lookup — the resolved Collection's own
// owner is what the redirect and canonical URL use.
const shareRouter = createRouter();

shareRouter.get(
  ['/u/:username/collections/:id', '/u/:username/lists/:id'],
  validate({ params: shareCollectionParamsSchema }),
  ShareController.getCollectionCard,
);

export default shareRouter;
