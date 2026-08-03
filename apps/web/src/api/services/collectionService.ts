import { backendApi } from '..';

import { CollectionMapper } from '../mappers/collection.mapper';

import type {
  ChangeCollaboratorRoleInput,
  Collection,
  CollectionInvitation,
  CollectionItemMutationInput,
  CollectionItemRemovalInput,
  CollectionRemovalInput,
  CollectionReorderInput,
  CreateCollectionInput,
  InviteCollaboratorInput,
  RemoveCollaboratorInput,
  RespondInvitationInput,
  TransferOwnershipInput,
  UpdateCollectionInput,
} from '@/models/collection.model';

const requireCollection = (value: Collection | null): Collection => {
  if (value === null) throw new Error('The Collection response was invalid.');
  return value;
};

const requireInvitation = (value: CollectionInvitation | null): CollectionInvitation => {
  if (value === null) throw new Error('The Collection invitation response was invalid.');
  return value;
};

export namespace CollectionService {
  export const list = async (): Promise<readonly Collection[]> => {
    const { data } = await backendApi.get<unknown>('/collections');
    return CollectionMapper.fromListDto(data);
  };

  export const create = async (input: CreateCollectionInput): Promise<Collection> => {
    const { data } = await backendApi.post<unknown>(
      '/collections',
      CollectionMapper.toCreateInput(input),
    );
    return requireCollection(CollectionMapper.fromDto(data));
  };

  export const getById = async (id: string): Promise<Collection> => {
    const { data } = await backendApi.get<unknown>(`/collections/${id}`);
    return requireCollection(CollectionMapper.fromDto(data));
  };

  export const update = async ({
    id,
    version,
    ...input
  }: UpdateCollectionInput): Promise<Collection> => {
    const { data } = await backendApi.patch<unknown>(`/collections/${id}`, { ...input, version });
    return requireCollection(CollectionMapper.fromDto(data));
  };

  export const addItem = async ({
    id,
    version,
    item,
  }: CollectionItemMutationInput): Promise<Collection> => {
    const { data } = await backendApi.post<unknown>(`/collections/${id}/items`, { item, version });
    return requireCollection(CollectionMapper.fromDto(data));
  };

  export const removeItem = async ({
    id,
    version,
    item,
  }: CollectionItemRemovalInput): Promise<Collection> => {
    const { data } = await backendApi.delete<unknown>(
      `/collections/${id}/items/${item.mediaType}/${item.tmdbId}`,
      { data: { version } },
    );
    return requireCollection(CollectionMapper.fromDto(data));
  };

  export const reorderItems = async ({
    id,
    version,
    items,
  }: CollectionReorderInput): Promise<Collection> => {
    const { data } = await backendApi.put<unknown>(`/collections/${id}/items/order`, {
      items,
      version,
    });
    return requireCollection(CollectionMapper.fromDto(data));
  };

  export const duplicate = async (id: string): Promise<Collection> => {
    const { data } = await backendApi.post<unknown>(`/collections/${id}/duplicate`);
    return requireCollection(CollectionMapper.fromDto(data));
  };

  export const remove = async ({ id, version }: CollectionRemovalInput): Promise<void> => {
    await backendApi.delete(`/collections/${id}`, { data: { version } });
  };

  export const getPublic = async (username: string, collectionId: string): Promise<Collection> => {
    const { data } = await backendApi.get<unknown>(`/user/list/${username}/${collectionId}`);
    return requireCollection(CollectionMapper.fromPublicDto(data));
  };

  export const listInvitations = async (): Promise<readonly CollectionInvitation[]> => {
    const { data } = await backendApi.get<unknown>('/collections/invitations');
    return CollectionMapper.fromInvitationListDto(data);
  };

  export const inviteCollaborator = async ({
    collectionId,
    username,
    role,
  }: InviteCollaboratorInput): Promise<CollectionInvitation> => {
    const { data } = await backendApi.post<unknown>(`/collections/${collectionId}/collaborators`, {
      username,
      role,
    });
    return requireInvitation(CollectionMapper.fromInvitationDto(data));
  };

  export const respondToInvitation = async ({
    invitationId,
    decision,
  }: RespondInvitationInput): Promise<CollectionInvitation> => {
    const { data } = await backendApi.post<unknown>(
      `/collections/invitations/${invitationId}/respond`,
      { decision },
    );
    return requireInvitation(CollectionMapper.fromInvitationDto(data));
  };

  export const revokeInvitation = async (invitationId: string): Promise<CollectionInvitation> => {
    const { data } = await backendApi.post<unknown>(
      `/collections/invitations/${invitationId}/revoke`,
    );
    return requireInvitation(CollectionMapper.fromInvitationDto(data));
  };

  export const changeCollaboratorRole = async ({
    collectionId,
    userId,
    role,
  }: ChangeCollaboratorRoleInput): Promise<Collection> => {
    const { data } = await backendApi.patch<unknown>(
      `/collections/${collectionId}/collaborators/${userId}`,
      { role },
    );
    return requireCollection(CollectionMapper.fromDto(data));
  };

  export const removeCollaborator = async ({
    collectionId,
    userId,
  }: RemoveCollaboratorInput): Promise<Collection> => {
    const { data } = await backendApi.delete<unknown>(
      `/collections/${collectionId}/collaborators/${userId}`,
    );
    return requireCollection(CollectionMapper.fromDto(data));
  };

  export const transferOwnership = async ({
    collectionId,
    userId,
  }: TransferOwnershipInput): Promise<Collection> => {
    const { data } = await backendApi.post<unknown>(`/collections/${collectionId}/transfer`, {
      userId,
    });
    return requireCollection(CollectionMapper.fromDto(data));
  };
}
