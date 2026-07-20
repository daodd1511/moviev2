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

  /** Order. */
  readonly order: number;
}

/** Crew dto. */
export interface CrewDto {

  /** Id. */
  readonly id: number;

  /** Name. */
  readonly name: string;

  /** Job. */
  readonly job: string;

  /** Department. */
  readonly department: string;

  /** Profile path. */
  readonly profile_path: string | null;
}

/** Credits dto. */
export interface CreditsDto {

  /** Cast. */
  readonly cast: readonly CastDto[];

  /** Crew. */
  readonly crew: readonly CrewDto[];
}
