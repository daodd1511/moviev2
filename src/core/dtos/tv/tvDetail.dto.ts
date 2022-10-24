import { GenreDto } from '../genre.dto';

import { SeasonDto } from './season.dto';
import { TvDto } from './tv.dto';

/** Tv detail dto. */
export interface TvDetailDto extends TvDto {

  /** Seasons. */
  readonly seasons: SeasonDto[];

  /** Tagline. */
  readonly tagline: string;

  /** Genres. */
  readonly genres: GenreDto[];
}
