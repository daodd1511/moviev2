import { Immerable, OmitImmerable } from '../../immerable';

/** Episode. */
export class Episode extends Immerable {
  /** Air date. */
  public readonly airDate: string;

  /** Id. */
  public readonly id: number;

  /** Name. */
  public readonly name: string;

  /** Overview. */
  public readonly overview: string;

  /** Episode number. */
  public readonly episodeNumber: number;

  public constructor(data: InitArgsEpisode) {
    super();
    this.airDate = data.airDate;
    this.id = data.id;
    this.name = data.name;
    this.overview = data.overview;
    this.episodeNumber = data.episodeNumber;
  }
}
type InitArgsEpisode = OmitImmerable<Episode>;
