
/** Genre dto. */
export interface GenreDto {

  /** Genre id. */
  readonly id: number;

  /** Genre name. */
  readonly name: string;
}

/** Genre response. */
export interface GenreResponseDto {

  /** Genres data. */
  readonly genres: readonly GenreDto[];
}
