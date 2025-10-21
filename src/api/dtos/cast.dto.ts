/** Cast dto. */
export interface CastDto {

  /** Id. */
  readonly id: number;

  /** Name. */
  readonly name: string;

  /** Character. */
  readonly character: string;

  /** Profile path. */
  readonly profile_path: string | null;
}

/** Credits dto. */
export interface CreditsDto {

  /** Cast. */
  readonly cast: readonly CastDto[];

  /** Crew. */
  readonly crew: readonly CastDto[];
}
