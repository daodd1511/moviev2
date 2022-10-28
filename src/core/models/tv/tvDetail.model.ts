import { OmitImmerable } from '../../immerable';

import { Genre } from '../genre.model';

import { Video } from '..';

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

  /** Videos. */
  public readonly videos: readonly Video[];

  public constructor(data: InitArgsTvDetail) {
    super(data);
    this.seasons = data.seasons;
    this.tagline = data.tagline;
    this.genres = data.genres;
    this.videos = data.videos;
  }
}

type InitArgsTvDetail = OmitImmerable<TvDetail>;
