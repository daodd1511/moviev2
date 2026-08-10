import { Immerable, OmitImmerable } from '../immerable';

import { Episode } from './episode.model';

/** Detailed season metadata and its episodes. */
export class SeasonDetail extends Immerable {
  /** Air date. */
  public readonly airDate: string | null;

  /** Episodes in this season. */
  public readonly episodes: readonly Episode[];

  /** TMDB season id. */
  public readonly id: number;

  /** Season name. */
  public readonly name: string;

  /** Season overview. */
  public readonly overview: string;

  /** Season poster path. */
  public readonly posterPath: string | null;

  /** Season number. */
  public readonly seasonNumber: number;

  public constructor(data: InitArgsSeasonDetail) {
    super();
    this.airDate = data.airDate;
    this.episodes = data.episodes;
    this.id = data.id;
    this.name = data.name;
    this.overview = data.overview;
    this.posterPath = data.posterPath;
    this.seasonNumber = data.seasonNumber;
  }
}

type InitArgsSeasonDetail = OmitImmerable<SeasonDetail>;
