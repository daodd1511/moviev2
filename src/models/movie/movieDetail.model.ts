import { Genre, Movie, Video } from '..';
import { OmitImmerable } from '../immerable';
import { SpokenLanguage } from '../spokenLang.model';

/** Movie. */
export class MovieDetail extends Movie {
  /** Budget. */
  public readonly budget: number;

  /** Genres. */
  public readonly genres: Genre[];

  /** Homepage. */
  public readonly homepage: string;

  /** Imdb id. */
  public readonly imdbId: string | null;

  /** Revenue. */
  public readonly revenue: number;

  /** Runtime. */
  public readonly runtime: number | null;

  /** Spoken languages. */
  public readonly spokenLanguages: SpokenLanguage[];

  /** Status. */
  public readonly status: string;

  /** Tagline. */
  public readonly tagline: string;

  /** Video. */
  public readonly video: boolean;

  /** Videos. */
  public readonly videos: readonly Video[];

  public constructor(data: InitArgsMovieDetail) {
    super(data);
    this.budget = data.budget;
    this.genres = data.genres;
    this.homepage = data.homepage;
    this.imdbId = data.imdbId;
    this.revenue = data.revenue;
    this.runtime = data.runtime;
    this.spokenLanguages = data.spokenLanguages;
    this.status = data.status;
    this.tagline = data.tagline;
    this.video = data.video;
    this.videos = data.videos;
  }
}

type InitArgsMovieDetail = OmitImmerable<MovieDetail>;
