import { Immerable, OmitImmerable } from '../../immerable';

/** Season. */
export class Season extends Immerable {
  /** Air date. */
  public readonly airDate: string;

  /** Episode count. */
  public readonly episodeCount: number;

  /** Id. */
  public readonly id: number;

  /** Name. */
  public readonly name: string;

  /** Overview. */
  public readonly overview: string;

  /** Poster path. */
  public readonly posterPath: string | null;

  /** Season number. */
  public readonly seasonNumber: number;

  public constructor(data: InitArgsSeason) {
    super();
    this.airDate = data.airDate;
    this.episodeCount = data.episodeCount;
    this.id = data.id;
    this.name = data.name;
    this.overview = data.overview;
    this.posterPath = data.posterPath;
    this.seasonNumber = data.seasonNumber;
  }
}
type InitArgsSeason = OmitImmerable<Season>;
