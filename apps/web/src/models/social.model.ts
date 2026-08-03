import type { CollectionItem, CollectionItemKey, CollectionVisibility } from './collection.model';

export interface SocialProfile {
  readonly username: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly followerCount: number;
  readonly followingCount: number;
  readonly isFollowedByViewer: boolean;
}

export interface PublicCollectionSummary {
  readonly id: string;
  readonly ownerUsername: string;
  readonly name: string;
  readonly description: string | null;
  readonly cover: CollectionItemKey | null;
  readonly itemCount: number;
  readonly likeCount: number;
  readonly createdAt: string;
}

export interface PublicCollection {
  readonly id: string;
  readonly ownerUsername: string;
  readonly name: string;
  readonly description: string | null;
  readonly visibility: CollectionVisibility;
  readonly cover: CollectionItemKey | null;
  readonly items: readonly CollectionItem[];
  readonly itemCount: number;
  readonly likeCount: number;
  readonly isLikedByViewer: boolean;
  readonly createdAt: string;
}

export type CollectionDiscoverySort = 'popular' | 'newest';

export interface DiscoverCollectionsInput {
  readonly sort: CollectionDiscoverySort;
  readonly page: number;
  readonly limit: number;
}
