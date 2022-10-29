/** Video dto. */
export interface VideoDto {

  /** Id. */
  readonly id: string;

  /** Key. */
  readonly key: string;

  /** Type. */
  readonly type: string;
}

/** Video response dto. */
export interface VideoResponseDto {

  /** Id. */
  readonly id: number;

  /** Results. */
  readonly results: readonly VideoDto[];
}
