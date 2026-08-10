import { Immerable, OmitImmerable } from '../immerable';

/** Episode. */
export class Episode extends Immerable {
  /** Air date. */
  public readonly airDate: string | null;

  /** Id. */
  public readonly id: number;

  /** Name. */
  public readonly name: string;

  /** Overview. */
  public readonly overview: string;

  /** Episode number. */
  public readonly episodeNumber: number;

  /** Runtime in minutes. */
  public readonly runtime: number | null;

  /** Episode still path. */
  public readonly stillPath: string | null;

  /** Public TMDB vote average. */
  public readonly voteAverage: number | null;

  public constructor(data: InitArgsEpisode) {
    super();
    this.airDate = data.airDate;
    this.id = data.id;
    this.name = data.name;
    this.overview = data.overview;
    this.episodeNumber = data.episodeNumber;
    this.runtime = data.runtime;
    this.stillPath = data.stillPath;
    this.voteAverage = data.voteAverage;
  }
}
type InitArgsEpisode = OmitImmerable<Episode>;
