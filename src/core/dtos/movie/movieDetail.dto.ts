import { GenreDto, MovieDto } from '..';
import { SpokenLanguageDto } from '../spokenLang.dto';

/** Movie detail dto. */
export interface MovieDetailDto extends MovieDto {

  /** Budget. */
  readonly budget: number;

  /** Genres. */
  readonly genres: GenreDto[];

  /** Homepage. */
  readonly homepage: string;

  /** Imdb id. */
  readonly imdb_id: string | null;

  /** Revenue. */
  readonly revenue: number;

  /** Runtime. */
  readonly runtime: number | null;

  /** Spoken languages. */
  readonly spoken_languages: SpokenLanguageDto[];

  /** Status. */
  readonly status: string;

  /** Tagline. */
  readonly tagline: string;

  /** Video. */
  readonly video: boolean;

}

// Optional
//   /** Production companies. */
//   readonly production_companies: ProductionCompanyDto[];

//   /** Production countries. */
//   readonly production_countries: ProductionCountryDto[];
