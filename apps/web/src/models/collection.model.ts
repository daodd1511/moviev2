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
