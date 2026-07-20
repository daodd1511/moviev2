import { OmitImmerable, Immerable } from '../immerable';

/** Tv. */
export class Tv extends Immerable {
  // Tv model

  /** Poster path. */
  public readonly posterPath: string | null;

  /** Popularity. */
  public readonly popularity: number;

  /** Id. */
  public readonly id: number;

  /** Vote average. */
  public readonly voteAverage: number;

  /** Backdrop path. */
  public readonly backdropPath: string | null;

  /** Overview. */
  public readonly overview: string;

  /** First air date. */
  public readonly firstAirDate: string;

  /** Origin country. */
  public readonly originCountry: string[];

  /** Genre ids. */
  public readonly genreIds: number[];

  /** Original language. */
  public readonly originalLanguage: string;

  /** Vote count. */
  public readonly voteCount: number;

  /** Name. */
  public readonly name: string;

  /** Original name. */
  public readonly originalName: string;

  public constructor(data: InitArgsTv) {
    super();
    this.id = data.id;
    this.posterPath = data.posterPath;
    this.overview = data.overview;
    this.genreIds = data.genreIds;
    this.originalLanguage = data.originalLanguage;
    this.backdropPath = data.backdropPath;
    this.popularity = data.popularity;
    this.voteCount = data.voteCount;
    this.voteAverage = data.voteAverage;
    this.firstAirDate = data.firstAirDate;
    this.originCountry = data.originCountry;
    this.name = data.name;
    this.originalName = data.originalName;
  }
}

type InitArgsTv = OmitImmerable<Tv>;
