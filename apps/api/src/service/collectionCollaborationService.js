import Collection from '../model/collection.js';
import CollectionInvitation from '../model/collection-invitation.js';
import User from '../model/user.js';
import { AppError } from '../errors/app-error.js';
import NotificationService from './notificationService.js';

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const collectionNotFound = () =>
  new AppError({ status: 404, code: 'collection_not_found', message: 'Collection not found.' });
const invitationNotFound = () =>
  new AppError({
    status: 404,
    code: 'invitation_not_found',
    message: 'Invitation not found.',
  });
const forbidden = message =>
  new AppError({ status: 403, code: 'collaboration_forbidden', message });
const invitationNotPending = () =>
  new AppError({
    status: 409,
    code: 'invitation_not_pending',
    message: 'This invitation is no longer pending.',
  });

const roleOf = (collection, userId) =>
  collection.collaborators.find(collaborator => collaborator.userId.equals(userId))?.role;

const requireOwner = async (actorId, collectionId) => {
  const collection = await Collection.findById(collectionId);
  if (collection === null) throw collectionNotFound();
  if (roleOf(collection, actorId) !== 'owner')
    throw forbidden('Only the Collection owner can manage collaborators.');
  return collection;
};

/** Marks a pending invitation expired in place if its TTL has passed. */
const expireIfPast = async invitation => {
  if (invitation.status === 'pending' && invitation.expiresAt.getTime() < Date.now()) {
    invitation.status = 'expired';
    invitation.respondedAt = new Date();
    await invitation.save();
  }
  return invitation;
};

const CollectionCollaborationService = {
  async invite(actorId, collectionId, username, role) {
    const collection = await requireOwner(actorId, collectionId);
    const invitee = await User.findOne({ username });
    if (invitee === null)
      throw new AppError({ status: 404, code: 'user_not_found', message: 'User not found.' });
    if (roleOf(collection, invitee._id) !== undefined)
      throw new AppError({
        status: 409,
        code: 'collaborator_exists',
        message: 'This user already has access to the Collection.',
      });
    let invitation;
    try {
      invitation = await CollectionInvitation.create({
        collectionId,
        inviterId: actorId,
        inviteeId: invitee._id,
        role,
        expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
      });
    } catch (error) {
      if (error.code === 11000) throw invitationNotPending();
      throw error;
    }
    await NotificationService.notifyCollectionInvite({
      recipientId: invitee._id,
      invitationId: invitation._id,
      collectionId,
      collectionName: collection.name,
    });
    return invitation;
  },

  async listForUser(userId) {
    return CollectionInvitation.find({ inviteeId: userId, status: 'pending' }).sort({
      createdAt: -1,
    });
  },

  async respond(userId, invitationId, decision) {
    const invitation = await CollectionInvitation.findOne({
      _id: invitationId,
      inviteeId: userId,
    });
    if (invitation === null) throw invitationNotFound();
    await expireIfPast(invitation);
    if (invitation.status !== 'pending') throw invitationNotPending();

    invitation.status = decision === 'accept' ? 'accepted' : 'declined';
    invitation.respondedAt = new Date();
    await invitation.save();

    if (decision === 'accept')
      await Collection.updateOne(
        { _id: invitation.collectionId },
        { $push: { collaborators: { userId, role: invitation.role } } },
      );
    return invitation;
  },

  async revoke(actorId, invitationId) {
    const invitation = await CollectionInvitation.findById(invitationId);
    if (invitation === null) throw invitationNotFound();
    await requireOwner(actorId, invitation.collectionId);
    if (invitation.status !== 'pending') throw invitationNotPending();

    invitation.status = 'revoked';
    invitation.respondedAt = new Date();
    await invitation.save();
    return invitation;
  },

  async changeRole(actorId, collectionId, userId, role) {
    await requireOwner(actorId, collectionId);
    if (String(userId) === String(actorId))
      throw new AppError({
        status: 400,
        code: 'owner_role_immutable',
        message: "The owner's role cannot be changed.",
      });
    const updated = await Collection.findOneAndUpdate(
      { _id: collectionId, collaborators: { $elemMatch: { userId, role: { $ne: 'owner' } } } },
      { $set: { 'collaborators.$.role': role } },
      { new: true },
    );
    if (updated === null)
      throw new AppError({
        status: 404,
        code: 'collaborator_not_found',
        message: 'Collaborator not found.',
      });
    return updated;
  },

  async remove(actorId, collectionId, userId) {
    await requireOwner(actorId, collectionId);
    if (String(userId) === String(actorId))
      throw new AppError({
        status: 400,
        code: 'owner_removal_forbidden',
        message: 'The Collection owner cannot be removed.',
      });
    const updated = await Collection.findOneAndUpdate(
      { _id: collectionId },
      { $pull: { collaborators: { userId, role: { $ne: 'owner' } } } },
      { new: true },
    );
    if (updated === null) throw collectionNotFound();
    return updated;
  },

  async transferOwnership(ownerId, collectionId, userId) {
    const collection = await requireOwner(ownerId, collectionId);
    if (roleOf(collection, userId) === undefined)
      throw new AppError({
        status: 404,
        code: 'collaborator_not_found',
        message: 'Collaborator not found.',
      });
    const updated = await Collection.findOneAndUpdate(
      { _id: collectionId, ownerId, version: collection.version },
      {
        $set: {
          ownerId: userId,
          'collaborators.$[previousOwner].role': 'editor',
          'collaborators.$[newOwner].role': 'owner',
        },
        $inc: { version: 1 },
      },
      {
        new: true,
        arrayFilters: [{ 'previousOwner.userId': ownerId }, { 'newOwner.userId': userId }],
      },
    );
    if (updated === null)
      throw new AppError({
        status: 409,
        code: 'collection_version_conflict',
        message: 'This Collection changed. Reload and try again.',
      });
    return updated;
  },
};

export default CollectionCollaborationService;
