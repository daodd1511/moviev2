import { MovieDto, TvDto } from './';

/** Search dto. */
export interface SearchDto extends MovieDto, TvDto {

  /** Media type. */
  readonly media_type: string;
}

/** Search response dto. */
export interface SearchResponseDto {

  /** Page. */
  readonly page: number;

  /** Results. */
  readonly results: readonly SearchDto[];
}
