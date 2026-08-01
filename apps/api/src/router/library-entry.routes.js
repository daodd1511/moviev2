import { verifyToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import LibraryEntryController from '../controller/library-entry.controller.js';
import {
  libraryEntryParamsSchema,
  libraryEntryQuerySchema,
  upsertLibraryEntrySchema,
} from '../validation/library-entry.schema.js';
import { createRouter } from './create-router.js';

const libraryEntryRouter = createRouter();

libraryEntryRouter.use(verifyToken);
libraryEntryRouter.get('/', validate({ query: libraryEntryQuerySchema }), LibraryEntryController.list);
libraryEntryRouter.put('/', validate({ body: upsertLibraryEntrySchema }), LibraryEntryController.upsert);
libraryEntryRouter.delete(
  '/:mediaType/:tmdbId',
  validate({ params: libraryEntryParamsSchema }),
  LibraryEntryController.remove,
);

export default libraryEntryRouter;
