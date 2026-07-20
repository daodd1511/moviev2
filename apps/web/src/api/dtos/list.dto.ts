import { Media } from '@/models';

/** List dto. */
export interface ListDto {

  /** List id. */
  readonly _id: string;

  /** List name. */
  readonly name: string;

  /** List description. */
  readonly description: string;

  /** Movie items. */
  readonly movies: Media[];

  /** Tv items. */
  readonly tvShows: Media[];

  /** Create at. */
  readonly createAt: string;

  /** Update at. */
  readonly updateAt: string;
}
