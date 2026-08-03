import CatalogController from '../controller/catalog.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  catalogDiscoverSchema,
  catalogMediaParamsSchema,
  catalogScheduleSchema,
  catalogSearchSchema,
} from '../validation/catalog.schema.js';
import { createRouter } from './create-router.js';

const catalogRouter = createRouter();
catalogRouter.get('/search', validate({ query: catalogSearchSchema }), CatalogController.search);
catalogRouter.get(
  '/discover',
  validate({ query: catalogDiscoverSchema }),
  CatalogController.discover,
);
catalogRouter.get(
  '/schedule',
  validate({ query: catalogScheduleSchema }),
  CatalogController.getReleaseSchedule,
);
catalogRouter.get(
  '/:mediaType/:id',
  validate({ params: catalogMediaParamsSchema }),
  CatalogController.getMedia,
);
export default catalogRouter;
