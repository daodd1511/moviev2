import {
  libraryEntryDtoSchema,
  libraryEntryListDtoSchema,
  LibraryEntryDto,
} from '../dtos/library-entry.dto';

import { LibraryEntry, LibraryEntryInput } from '@/models/library-entry.model';
import { Media } from '@/models/media.model';
import { MediaType } from '@/shared/enums/mediaType';

const toNullableDate = (value: string): string | null => (value === '' ? null : value);

const parseDto = (dto: unknown): LibraryEntryDto | null => {
  const result = libraryEntryDtoSchema.safeParse(dto);
  if (result.success) return result.data;

  console.error('[LibraryEntryMapper] Invalid Library Entry response.', result.error.issues);
  return null;
};

export namespace LibraryEntryMapper {
  export const fromDto = (dto: unknown): LibraryEntry | null => parseDto(dto);

  export const fromListDto = (dto: unknown): readonly LibraryEntry[] => {
    const result = libraryEntryListDtoSchema.safeParse(dto);
    if (!result.success) {
      console.error(
        '[LibraryEntryMapper] Invalid Library Entry list response.',
        result.error.issues,
      );
      return [];
    }
    return result.data.entries;
  };

  export const toInput = (media: Media): LibraryEntryInput => {
    if (media.type !== MediaType.Movie && media.type !== MediaType.Tv) {
      throw new Error('Only movie and TV media can be added to the Library.');
    }

    return {
      mediaType: media.type,
      tmdbId: media.id,
      watchState: 'planned',
      rating: null,
      notes: null,
      startedAt: null,
      completedAt: null,
      lastWatchedAt: null,
      tvProgress: null,
      mediaSnapshot: {
        title: media.title,
        posterPath: media.posterPath,
        releaseDate: toNullableDate(media.releaseDate),
        voteAverage: media.voteAverage,
      },
    };
  };
}
