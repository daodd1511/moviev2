export const toCollectionDto = collection => ({
  id: collection._id.toString(),
  ownerId: collection.ownerId.toString(),
  name: collection.name,
  description: collection.description,
  visibility: collection.visibility,
  items: collection.items,
  collaborators: collection.collaborators.map(collaborator => ({
    userId: collaborator.userId.toString(),
    role: collaborator.role,
  })),
  cover: collection.cover,
  version: collection.version,
  legacyPublicId: collection.legacyPublicId,
  createdAt: collection.createdAt,
  updatedAt: collection.updatedAt,
});
