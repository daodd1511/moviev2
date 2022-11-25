import { Immerable, OmitImmerable } from './immerable';
import { Movie } from './movie/movie.model';
import { Tv } from './tv/tv.model';

/** List model. */
export class List extends Immerable {
  /** List id. */
  public readonly id: string;

  /** List name. */
  public readonly name: string;

  /** List description. */
  public readonly description: string;

  /** Movie items. */
  public readonly movies: Movie[];

  /** Tv items. */
  public readonly tvShows: Tv[];

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
