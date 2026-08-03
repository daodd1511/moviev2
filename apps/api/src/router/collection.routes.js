import { verifyToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import CollectionController from '../controller/collection.controller.js';
import CollectionCollaborationController from '../controller/collection-collaboration.controller.js';
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
import {
  changeCollaboratorRoleSchema,
  collectionCollaboratorParamsSchema,
  invitationIdParamsSchema,
  inviteCollaboratorSchema,
  respondInvitationSchema,
  transferOwnershipSchema,
} from '../validation/collection-collaboration.schema.js';

const collectionRouter = createRouter();
collectionRouter.use(verifyToken);

collectionRouter.get('/', CollectionController.list);
collectionRouter.post('/', validate({ body: createCollectionSchema }), CollectionController.create);

// Registered ahead of `GET /:id` so these literal paths are not captured by the `:id` param.
collectionRouter.get('/invitations', CollectionCollaborationController.listInvitations);
collectionRouter.post(
  '/invitations/:invitationId/respond',
  validate({ params: invitationIdParamsSchema, body: respondInvitationSchema }),
  CollectionCollaborationController.respond,
);
collectionRouter.post(
  '/invitations/:invitationId/revoke',
  validate({ params: invitationIdParamsSchema }),
  CollectionCollaborationController.revoke,
);

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
collectionRouter.post(
  '/:id/collaborators',
  validate({ params: collectionIdParamsSchema, body: inviteCollaboratorSchema }),
  CollectionCollaborationController.invite,
);
collectionRouter.patch(
  '/:id/collaborators/:userId',
  validate({ params: collectionCollaboratorParamsSchema, body: changeCollaboratorRoleSchema }),
  CollectionCollaborationController.changeRole,
);
collectionRouter.delete(
  '/:id/collaborators/:userId',
  validate({ params: collectionCollaboratorParamsSchema }),
  CollectionCollaborationController.removeCollaborator,
);
collectionRouter.post(
  '/:id/transfer',
  validate({ params: collectionIdParamsSchema, body: transferOwnershipSchema }),
  CollectionCollaborationController.transferOwnership,
);

export default collectionRouter;
