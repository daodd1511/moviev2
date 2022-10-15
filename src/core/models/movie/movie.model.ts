import { OmitImmerable, Immerable } from '../../immerable';

/** Movie. */
export class Movie extends Immerable {
  /** ID. */
  public readonly id: number;

  /** Poster path. */
  public readonly posterPath: string | null;

  /** Adult. */
  public readonly adult: boolean;

  /** Overview. */
  public readonly overview: string;

  /** Release date. */
  public readonly releaseDate: string;

  /** Genre ids. */
  public readonly genreIds: number[];

  /** Original title. */
  public readonly originalTitle: string;

  /** Original language. */
  public readonly originalLanguage: string;

  /** Title. */
  public readonly title: string;

  /** Backdrop path. */
  public readonly backdropPath: string | null;

  /** Popularity. */
  public readonly popularity: number;

  /** Vote count. */
  public readonly voteCount: number;

  /** Vote average. */
  public readonly voteAverage: number;

  public constructor(data: InitArgsMovie) {
    super();
    this.id = data.id;
    this.posterPath = data.posterPath;
    this.adult = data.adult;
    this.overview = data.overview;
    this.releaseDate = data.releaseDate;
    this.genreIds = data.genreIds;
    this.originalTitle = data.originalTitle;
    this.originalLanguage = data.originalLanguage;
    this.title = data.title;
    this.backdropPath = data.backdropPath;
    this.popularity = data.popularity;
    this.voteCount = data.voteCount;
    this.voteAverage = data.voteAverage;
  }
}

type InitArgsMovie = OmitImmerable<Movie>;
