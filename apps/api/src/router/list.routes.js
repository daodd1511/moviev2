import { verifyToken } from '../middleware/auth.middleware.js';
import ListController from '../controller/list.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { listBodySchema, listIdParamsSchema, mediaSchema } from '../validation/list.schema.js';
import { createRouter } from './create-router.js';

const listRouter = createRouter();
listRouter.use(verifyToken);

listRouter.get('/', ListController.getAll);
listRouter.post('/', validate({ body: listBodySchema }), ListController.create);
listRouter.delete('/', ListController.clearAll);

listRouter.get('/:id', validate({ params: listIdParamsSchema }), ListController.getListById);
listRouter.put(
  '/:id',
  validate({ params: listIdParamsSchema, body: listBodySchema }),
  ListController.update,
);
listRouter.delete('/:id', validate({ params: listIdParamsSchema }), ListController.remove);
listRouter.delete('/:id/items', validate({ params: listIdParamsSchema }), ListController.clear);

listRouter.post(
  '/:id/movie',
  validate({ params: listIdParamsSchema, body: mediaSchema }),
  ListController.addMovie,
);
listRouter.delete(
  '/:id/movie',
  validate({ params: listIdParamsSchema, body: mediaSchema }),
  ListController.removeMovie,
);
listRouter.post(
  '/:id/tv',
  validate({ params: listIdParamsSchema, body: mediaSchema }),
  ListController.addTv,
);
listRouter.delete(
  '/:id/tv',
  validate({ params: listIdParamsSchema, body: mediaSchema }),
  ListController.removeTv,
);

export default listRouter;
