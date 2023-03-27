import { MovieDto, TvDto } from './';

import { MediaType } from '@/shared/enums/mediaType';

/** Search dto. */
export interface SearchDto extends MovieDto, TvDto {

  /** Media type. */
  readonly media_type: MediaType;
}

/** Search response dto. */
export interface SearchResponseDto {

  /** Page. */
  readonly page: number;

  /** Results. */
  readonly results: readonly SearchDto[];
}
