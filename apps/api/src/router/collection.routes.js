import { verifyToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import CollectionController from '../controller/collection.controller.js';
import { createRouter } from './create-router.js';
import {
  addCollectionItemSchema,
  collectionIdParamsSchema,
  collectionItemParamsSchema,
  createCollectionSchema,
  removeCollectionSchema,
  reorderCollectionItemsSchema,
  updateCollectionSchema,
} from '../validation/collection-request.schema.js';

const collectionRouter = createRouter();
collectionRouter.use(verifyToken);

collectionRouter.get('/', CollectionController.list);
collectionRouter.post('/', validate({ body: createCollectionSchema }), CollectionController.create);
collectionRouter.get(
  '/:id',
  validate({ params: collectionIdParamsSchema }),
  CollectionController.get,
);
collectionRouter.patch(
  '/:id',
  validate({ params: collectionIdParamsSchema, body: updateCollectionSchema }),
  CollectionController.update,
);
collectionRouter.delete(
  '/:id',
  validate({ params: collectionIdParamsSchema, body: removeCollectionSchema }),
  CollectionController.remove,
);
collectionRouter.post(
  '/:id/duplicate',
  validate({ params: collectionIdParamsSchema }),
  CollectionController.duplicate,
);
collectionRouter.post(
  '/:id/items',
  validate({ params: collectionIdParamsSchema, body: addCollectionItemSchema }),
  CollectionController.addItem,
);
collectionRouter.put(
  '/:id/items/order',
  validate({ params: collectionIdParamsSchema, body: reorderCollectionItemsSchema }),
  CollectionController.reorderItems,
);
collectionRouter.delete(
  '/:id/items/:mediaType/:tmdbId',
  validate({ params: collectionItemParamsSchema, body: removeCollectionSchema }),
  CollectionController.removeItem,
);

export default collectionRouter;
