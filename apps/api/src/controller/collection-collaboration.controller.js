import { toCollectionDto } from '../dto/collection.dto.js';
import CollectionCollaborationService from '../service/collectionCollaborationService.js';

const toInvitationDto = invitation => ({
  id: invitation._id.toString(),
  collectionId: invitation.collectionId.toString(),
  collectionName: invitation.collectionName,
  inviterId: invitation.inviterId.toString(),
  role: invitation.role,
  status: invitation.status,
  expiresAt: invitation.expiresAt,
  respondedAt: invitation.respondedAt,
  createdAt: invitation.createdAt,
});

const invite = async (req, res) => {
  const invitation = await CollectionCollaborationService.invite(
    req.userId,
    req.params.id,
    req.body.username,
    req.body.role,
  );
  res.status(201).json(toInvitationDto(invitation));
};

const listInvitations = async (req, res) => {
  const invitations = await CollectionCollaborationService.listForUser(req.userId);
  res.status(200).json({ invitations: invitations.map(toInvitationDto) });
};

const respond = async (req, res) => {
  const invitation = await CollectionCollaborationService.respond(
    req.userId,
    req.params.invitationId,
    req.body.decision,
  );
  res.status(200).json(toInvitationDto(invitation));
};

const revoke = async (req, res) => {
  const invitation = await CollectionCollaborationService.revoke(
    req.userId,
    req.params.invitationId,
  );
  res.status(200).json(toInvitationDto(invitation));
};

const changeRole = async (req, res) => {
  const collection = await CollectionCollaborationService.changeRole(
    req.userId,
    req.params.id,
    req.params.userId,
    req.body.role,
  );
  res.status(200).json(toCollectionDto(collection));
};

const removeCollaborator = async (req, res) => {
  const collection = await CollectionCollaborationService.remove(
    req.userId,
    req.params.id,
    req.params.userId,
  );
  res.status(200).json(toCollectionDto(collection));
};

const transferOwnership = async (req, res) => {
  const collection = await CollectionCollaborationService.transferOwnership(
    req.userId,
    req.params.id,
    req.body.userId,
  );
  res.status(200).json(toCollectionDto(collection));
};

const CollectionCollaborationController = {
  invite,
  listInvitations,
  respond,
  revoke,
  changeRole,
  removeCollaborator,
  transferOwnership,
};

export default CollectionCollaborationController;
