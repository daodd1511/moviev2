import { Episode, SeasonDetail } from '@/models';

/** Named quality bands for public TMDB episode ratings. */
export type QualityBand = 'awesome' | 'great' | 'good' | 'regular' | 'bad' | 'garbage';

/** Display metadata and fixed lower thresholds for every rated quality band. */
export const QUALITY_BANDS: Readonly<
  Record<QualityBand, { readonly label: string; readonly minimum: number }>
> = {
  awesome: { label: 'Awesome', minimum: 9 },
  great: { label: 'Great', minimum: 8 },
  good: { label: 'Good', minimum: 7 },
  regular: { label: 'Regular', minimum: 6 },
  bad: { label: 'Bad', minimum: 5 },
  garbage: { label: 'Garbage', minimum: Number.NEGATIVE_INFINITY },
};

/** A matrix position backed by a rated episode. */
export interface RatedEpisodeMatrixCell {
  readonly episode: Episode;
  readonly kind: 'rated';
  readonly voteAverage: number;
}

/** A matrix position backed by an episode without a public rating. */
export interface NotRatedEpisodeMatrixCell {
  readonly episode: Episode;
  readonly kind: 'notRated';
}

/** A matrix position beyond a season's available episode sequence. */
export interface NonexistentEpisodeMatrixCell {
  readonly kind: 'nonexistent';
}

/** Every possible cell state in the cross-season episode matrix. */
export type EpisodeMatrixCell =
  | RatedEpisodeMatrixCell
  | NotRatedEpisodeMatrixCell
  | NonexistentEpisodeMatrixCell;

/** One episode-number row across the selected season columns. */
export interface EpisodeMatrixRow {
  readonly cells: readonly EpisodeMatrixCell[];
  readonly episodeNumber: number;
}

/** Resolves the fixed display band for a public TMDB episode rating. */
export const getQualityBand = (voteAverage: number | null): QualityBand | 'notRated' => {
  if (voteAverage === null) {
    return 'notRated';
  }

  if (voteAverage >= QUALITY_BANDS.awesome.minimum) return 'awesome';
  if (voteAverage >= QUALITY_BANDS.great.minimum) return 'great';
  if (voteAverage >= QUALITY_BANDS.good.minimum) return 'good';
  if (voteAverage >= QUALITY_BANDS.regular.minimum) return 'regular';
  if (voteAverage >= QUALITY_BANDS.bad.minimum) return 'bad';
  return 'garbage';
};

/** Calculates the arithmetic mean of every rated episode in the supplied seasons. */
export const calculateEpisodeAverage = (seasons: readonly SeasonDetail[]): number | null => {
  const ratedEpisodes = seasons.flatMap(season =>
    season.episodes.filter(
      (episode): episode is Episode & { readonly voteAverage: number } =>
        episode.voteAverage !== null,
    ),
  );

  if (ratedEpisodes.length === 0) {
    return null;
  }

  const total = ratedEpisodes.reduce((sum, episode) => sum + episode.voteAverage, 0);
  return total / ratedEpisodes.length;
};

const getMatrixCell = (episode: Episode | undefined): EpisodeMatrixCell => {
  if (episode === undefined) {
    return { kind: 'nonexistent' };
  }

  if (episode.voteAverage === null) {
    return { episode, kind: 'notRated' };
  }

  return { episode, kind: 'rated', voteAverage: episode.voteAverage };
};

/** Builds numbered matrix rows that distinguish rated, unrated, and absent episodes. */
export const buildEpisodeMatrix = (
  seasons: readonly SeasonDetail[],
): readonly EpisodeMatrixRow[] => {
  const maxEpisodeNumber = Math.max(
    0,
    ...seasons.flatMap(season => season.episodes.map(episode => episode.episodeNumber)),
  );
  const episodesBySeason = seasons.map(
    season => new Map(season.episodes.map(episode => [episode.episodeNumber, episode])),
  );

  return Array.from({ length: maxEpisodeNumber }, (_, index) => {
    const episodeNumber = index + 1;
    return {
      episodeNumber,
      cells: episodesBySeason.map(episodes => getMatrixCell(episodes.get(episodeNumber))),
    };
  });
};
