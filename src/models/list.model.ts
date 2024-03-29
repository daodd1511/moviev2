import { Immerable, OmitImmerable } from './immerable';
import { Media } from './media.model';

/** List model. */
export class List extends Immerable {
  /** List id. */
  public readonly id: string;

  /** List name. */
  public readonly name: string;

  /** List description. */
  public readonly description: string;

  /** Movie items. */
  public readonly movies: Media[];

  /** Tv items. */
  public readonly tvShows: Media[];

  /** Create at. */
  public readonly createAt: Date;

  /** Update at. */
  public readonly updateAt: Date;

  public constructor(data: InitArgsSpokenLanguage) {
    super();
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.movies = data.movies;
    this.tvShows = data.tvShows;
    this.createAt = data.createAt;
    this.updateAt = data.updateAt;
  }
}

type InitArgsSpokenLanguage = OmitImmerable<List>;
