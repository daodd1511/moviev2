import { backendApi } from '..';

import { SocialMapper } from '../mappers/social.mapper';

import type {
  DiscoverCollectionsInput,
  PublicCollection,
  PublicCollectionSummary,
  SocialProfile,
} from '@/models/social.model';

const requireProfile = (value: SocialProfile | null): SocialProfile => {
  if (value === null) throw new Error('The social profile response was invalid.');
  return value;
};

const requireCollection = (value: PublicCollection | null): PublicCollection => {
  if (value === null) throw new Error('The public Collection response was invalid.');
  return value;
};

export namespace SocialService {
  export const getProfile = async (username: string): Promise<SocialProfile> => {
    const { data } = await backendApi.get<unknown>(`/social/profile/${username}`);
    return requireProfile(SocialMapper.fromProfileDto(data));
  };

  export const listFollowers = async (username: string): Promise<readonly string[]> => {
    const { data } = await backendApi.get<unknown>(`/social/profile/${username}/followers`);
    return SocialMapper.fromFollowersDto(data);
  };

  export const listFollowing = async (username: string): Promise<readonly string[]> => {
    const { data } = await backendApi.get<unknown>(`/social/profile/${username}/following`);
    return SocialMapper.fromFollowingDto(data);
  };

  export const follow = async (username: string): Promise<void> => {
    await backendApi.post(`/social/follow/${username}`);
  };

  export const unfollow = async (username: string): Promise<void> => {
    await backendApi.delete(`/social/follow/${username}`);
  };

  export const like = async (collectionId: string): Promise<void> => {
    await backendApi.post(`/social/collections/${collectionId}/like`);
  };

  export const unlike = async (collectionId: string): Promise<void> => {
    await backendApi.delete(`/social/collections/${collectionId}/like`);
  };

  export const discoverCollections = async (
    input: DiscoverCollectionsInput,
  ): Promise<readonly PublicCollectionSummary[]> => {
    const { data } = await backendApi.get<unknown>('/social/collections', { params: input });
    return SocialMapper.fromDiscoverDto(data);
  };

  export const getCollection = async (id: string): Promise<PublicCollection> => {
    const { data } = await backendApi.get<unknown>(`/social/collections/${id}`);
    return requireCollection(SocialMapper.fromCollectionDto(data));
  };
}
