import { OmitImmerable } from './immerable';
import { Movie } from './movie/movie.model';
import { Tv } from './tv/tv.model';

/** Movie Search. */
export class MovieSearch extends Movie {
  /** Media type. */
  public readonly mediaType: string;

  public constructor(data: InitArgsMovieSearch) {
    super(data);
    this.mediaType = data.mediaType;
  }
}

/** Tv Search. */
export class TvSearch extends Tv {
  /** Media type. */
  public readonly mediaType: string;

  public constructor(data: InitArgsTvSearch) {
    super(data);
    this.mediaType = data.mediaType;
  }
}
type InitArgsMovieSearch = OmitImmerable<MovieSearch>;
type InitArgsTvSearch = OmitImmerable<TvSearch>;
