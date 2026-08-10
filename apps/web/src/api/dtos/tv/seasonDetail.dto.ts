import { EpisodeDto } from './episode.dto';

/** TMDB season detail dto. */
export interface SeasonDetailDto {
  /** Air date. */
  readonly air_date: string | null;

  /** Episodes in this season. */
  readonly episodes: readonly EpisodeDto[];

  /** TMDB season id. */
  readonly id: number;

  /** Season name. */
  readonly name: string;

  /** Season overview. */
  readonly overview: string;

  /** Season poster path. */
  readonly poster_path: string | null;

  /** Season number. */
  readonly season_number: number;
}
