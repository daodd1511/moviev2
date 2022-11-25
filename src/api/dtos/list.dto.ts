import { MovieDto } from './movie/movie.dto';
import { TvDto } from './tv/tv.dto';

/** List dto. */
export interface ListDto {

  /** List id. */
  readonly _id: string;

  /** List name. */
  readonly name: string;

  /** List description. */
  readonly description: string;

  /** Movie items. */
  readonly movies: MovieDto[];

  /** Tv items. */
  readonly tvShows: TvDto[];

  /** Create at. */
  readonly createAt: string;

  /** Update at. */
  readonly updateAt: string;
}
