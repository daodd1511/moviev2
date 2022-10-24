import { OmitImmerable } from '../../immerable';

import { Genre } from '../genre.model';

import { Tv } from './tv.model';
import { Season } from './season.model';

/** Tv. */
export class TvDetail extends Tv {
  /** Season. */
  public readonly seasons: Season[];

  /** Tagline. */
  public readonly tagline: string;

  /** Genres. */
  public readonly genres: Genre[];

  public constructor(data: InitArgsTvDetail) {
    super(data);
    this.seasons = data.seasons;
    this.tagline = data.tagline;
    this.genres = data.genres;
  }
}

type InitArgsTvDetail = OmitImmerable<TvDetail>;
