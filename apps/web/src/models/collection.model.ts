export type CollectionMediaType = 'movie' | 'tv';
export type CollectionVisibility = 'private' | 'unlisted' | 'public';

export interface CollectionItem {
  readonly mediaType: CollectionMediaType;
  readonly tmdbId: number;
  readonly title: string;
  readonly posterPath: string | null;
  readonly releaseDate: string;
  readonly voteAverage: number;
}

export interface CollectionItemKey {
  readonly mediaType: CollectionMediaType;
  readonly tmdbId: number;
}

export interface CollectionCollaborator {
  readonly userId: string;
  readonly role: 'owner' | 'editor' | 'viewer';
}

export interface Collection {
  readonly id: string;
  readonly ownerId: string;
  readonly name: string;
  readonly description: string | null;
  readonly visibility: CollectionVisibility;
  readonly items: readonly CollectionItem[];
  readonly collaborators: readonly CollectionCollaborator[];
  readonly cover: CollectionItemKey | null;
  readonly likeCount: number;
  readonly version: number;
  readonly legacyPublicId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateCollectionInput {
  readonly name: string;
  readonly description: string | null;
  readonly visibility: CollectionVisibility;
  readonly items: readonly CollectionItem[];
  readonly cover: CollectionItemKey | null;
}

export interface UpdateCollectionInput {
  readonly id: string;
  readonly version: number;
  readonly name?: string;
  readonly description?: string | null;
  readonly visibility?: CollectionVisibility;
  readonly cover?: CollectionItemKey | null;
}

export interface CollectionItemMutationInput {
  readonly id: string;
  readonly version: number;
  readonly item: CollectionItem;
}

export interface CollectionItemRemovalInput {
  readonly id: string;
  readonly version: number;
  readonly item: CollectionItemKey;
}

export interface CollectionReorderInput {
  readonly id: string;
  readonly version: number;
  readonly items: readonly CollectionItemKey[];
}

export interface CollectionRemovalInput {
  readonly id: string;
  readonly version: number;
}

export type CollaboratorRole = 'editor' | 'viewer';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'revoked' | 'expired';

export interface CollectionInvitation {
  readonly id: string;
  readonly collectionId: string;
  readonly collectionName: string;
  readonly inviterId: string;
  readonly role: CollaboratorRole;
  readonly status: InvitationStatus;
  readonly expiresAt: string;
  readonly respondedAt: string | null;
  readonly createdAt: string;
}

export interface InviteCollaboratorInput {
  readonly collectionId: string;
  readonly username: string;
  readonly role: CollaboratorRole;
}

export interface RespondInvitationInput {
  readonly invitationId: string;
  readonly decision: 'accept' | 'decline';
}

export interface ChangeCollaboratorRoleInput {
  readonly collectionId: string;
  readonly userId: string;
  readonly role: CollaboratorRole;
}

export interface RemoveCollaboratorInput {
  readonly collectionId: string;
  readonly userId: string;
}

export interface TransferOwnershipInput {
  readonly collectionId: string;
  readonly userId: string;
}
