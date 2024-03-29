import { OmitImmerable, Immerable } from './immerable';

/** Media. */
export class Media extends Immerable {
  /** ID. */
  public readonly id: number;

  /** Poster path. */
  public readonly posterPath: string | null;

  /** Release date. */
  public readonly releaseDate: string;

  /** Title. */
  public readonly title: string;

  /** Vote average. */
  public readonly voteAverage: number;

  /** Type. */
  public readonly type: string;

  public constructor(data: InitArgsMedia) {
    super();
    this.id = data.id;
    this.posterPath = data.posterPath;
    this.releaseDate = data.releaseDate;
    this.title = data.title;
    this.voteAverage = data.voteAverage;
    this.type = data.type;
  }
}

type InitArgsMedia = OmitImmerable<Media>;
