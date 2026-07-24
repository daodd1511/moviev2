/** Video dto. */
export interface VideoDto {

  /** Id. */
  readonly id: string;

  /** Key. */
  readonly key: string;

  /** Type. */
  readonly type: string;

  /** Display name. */
  readonly name: string;

  /** Video provider. */
  readonly site: string;

  /** Whether the video is official. */
  readonly official: boolean;

  /** Publication timestamp. */
  readonly published_at: string;
}

/** Video response dto. */
export interface VideoResponseDto {

  /** Id. */
  readonly id: number;

  /** Results. */
  readonly results: readonly VideoDto[];
}
