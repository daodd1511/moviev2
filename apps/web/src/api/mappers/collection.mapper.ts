import {
  collectionDtoSchema,
  collectionInvitationDtoSchema,
  collectionInvitationListDtoSchema,
  collectionListDtoSchema,
  type CollectionDto,
} from '../dtos/collection.dto';

import type {
  Collection,
  CollectionInvitation,
  CollectionItem,
  CreateCollectionInput,
} from '@/models/collection.model';
import { Media } from '@/models/media.model';
import { MediaType } from '@/shared/enums/mediaType';

const logInvalid = (scope: string, issues: unknown): void => {
  console.error(`[CollectionMapper] Invalid ${scope} response.`, issues);
};

const fromCollectionDto = (dto: CollectionDto): Collection => dto;

export namespace CollectionMapper {
  export const fromDto = (dto: unknown): Collection | null => {
    const result = collectionDtoSchema.safeParse(dto);
    if (result.success) return fromCollectionDto(result.data);
    logInvalid('Collection', result.error.issues);
    return null;
  };

  export const fromListDto = (dto: unknown): readonly Collection[] => {
    const result = collectionListDtoSchema.safeParse(dto);
    if (result.success) return result.data.collections.map(fromCollectionDto);
    logInvalid('Collection list', result.error.issues);
    return [];
  };

  export const itemFromMedia = (media: Media): CollectionItem => {
    if (media.type !== MediaType.Movie && media.type !== MediaType.Tv) {
      throw new Error('Only movie and TV media can be added to a Collection.');
    }
    return {
      mediaType: media.type,
      tmdbId: media.id,
      title: media.title,
      posterPath: media.posterPath,
      releaseDate: media.releaseDate,
      voteAverage: media.voteAverage,
    };
  };

  export const toCreateInput = (input: CreateCollectionInput): CreateCollectionInput => input;

  export const fromInvitationDto = (dto: unknown): CollectionInvitation | null => {
    const result = collectionInvitationDtoSchema.safeParse(dto);
    if (result.success) return result.data;
    logInvalid('Collection invitation', result.error.issues);
    return null;
  };

  export const fromInvitationListDto = (dto: unknown): readonly CollectionInvitation[] => {
    const result = collectionInvitationListDtoSchema.safeParse(dto);
    if (result.success) return result.data.invitations;
    logInvalid('Collection invitation list', result.error.issues);
    return [];
  };
}
