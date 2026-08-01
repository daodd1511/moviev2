import { backendApi } from '..';

import { LibraryEntryMapper } from '../mappers/library-entry.mapper';

import {
  LibraryEntry,
  LibraryEntryFilters,
  LibraryEntryInput,
  LibraryEntryKey,
} from '@/models/library-entry.model';

export namespace LibraryEntryService {
  export const list = async (filters: LibraryEntryFilters): Promise<readonly LibraryEntry[]> => {
    const { data } = await backendApi.get<unknown>('/library/entries', { params: filters });
    return LibraryEntryMapper.fromListDto(data);
  };

  export const upsert = async (input: LibraryEntryInput): Promise<LibraryEntry> => {
    const { data } = await backendApi.put<unknown>('/library/entries', input);
    const entry = LibraryEntryMapper.fromDto(data);
    if (entry === null) throw new Error('The Library response was invalid.');
    return entry;
  };

  export const remove = async ({ mediaType, tmdbId }: LibraryEntryKey): Promise<void> => {
    await backendApi.delete(`/library/entries/${mediaType}/${tmdbId}`);
  };
}
