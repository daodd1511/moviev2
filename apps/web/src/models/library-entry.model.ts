export type LibraryWatchState = 'planned' | 'watching' | 'completed' | 'paused' | 'dropped';
export type LibraryMediaType = 'movie' | 'tv';

export interface LibraryTvProgress {
  readonly season: number;
  readonly episode: number;
  readonly watchedEpisodeCount: number | null;
}

export interface LibraryMediaSnapshot {
  readonly title: string;
  readonly posterPath: string | null;
  readonly releaseDate: string | null;
  readonly voteAverage: number;
}

export interface LibraryEntry {
  readonly id: string;
  readonly mediaType: LibraryMediaType;
  readonly tmdbId: number;
  readonly watchState: LibraryWatchState;
  readonly rating: number | null;
  readonly notes: string | null;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly lastWatchedAt: string | null;
  readonly tvProgress: LibraryTvProgress | null;
  readonly mediaSnapshot: LibraryMediaSnapshot;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface LibraryEntryInput {
  readonly mediaType: LibraryMediaType;
  readonly tmdbId: number;
  readonly watchState: LibraryWatchState;
  readonly rating: number | null;
  readonly notes: string | null;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly lastWatchedAt: string | null;
  readonly tvProgress: LibraryTvProgress | null;
  readonly mediaSnapshot: LibraryMediaSnapshot;
}

export interface LibraryEntryKey {
  readonly mediaType: LibraryMediaType;
  readonly tmdbId: number;
}

/** Entry field a Library listing is ordered by. */
export type LibraryEntrySort = 'updatedAt' | 'createdAt' | 'lastWatchedAt';

export interface LibraryEntryFilters {
  readonly watchState?: LibraryWatchState;
  readonly mediaType?: LibraryMediaType;
  readonly minRating?: number;
  readonly maxRating?: number;
  readonly sort?: LibraryEntrySort;
  readonly order?: 'asc' | 'desc';
}
