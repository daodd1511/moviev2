import {
  discoverCollectionsDtoSchema,
  followersDtoSchema,
  followingDtoSchema,
  publicCollectionDtoSchema,
  socialProfileDtoSchema,
} from '../dtos/social.dto';

import type {
  PublicCollection,
  PublicCollectionSummary,
  SocialProfile,
} from '@/models/social.model';

const logInvalid = (scope: string, issues: unknown): void => {
  console.error(`[SocialMapper] Invalid ${scope} response.`, issues);
};

export namespace SocialMapper {
  export const fromProfileDto = (dto: unknown): SocialProfile | null => {
    const result = socialProfileDtoSchema.safeParse(dto);
    if (result.success) return result.data;
    logInvalid('Social profile', result.error.issues);
    return null;
  };

  export const fromFollowersDto = (dto: unknown): readonly string[] => {
    const result = followersDtoSchema.safeParse(dto);
    if (result.success) return result.data.followers;
    logInvalid('Followers list', result.error.issues);
    return [];
  };

  export const fromFollowingDto = (dto: unknown): readonly string[] => {
    const result = followingDtoSchema.safeParse(dto);
    if (result.success) return result.data.following;
    logInvalid('Following list', result.error.issues);
    return [];
  };

  export const fromDiscoverDto = (dto: unknown): readonly PublicCollectionSummary[] => {
    const result = discoverCollectionsDtoSchema.safeParse(dto);
    if (result.success) return result.data.collections;
    logInvalid('Collection discovery list', result.error.issues);
    return [];
  };

  export const fromCollectionDto = (dto: unknown): PublicCollection | null => {
    const result = publicCollectionDtoSchema.safeParse(dto);
    if (result.success) return result.data;
    logInvalid('Public Collection', result.error.issues);
    return null;
  };
}
