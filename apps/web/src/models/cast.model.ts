/** Cast. */
export interface Cast {

  /** Id. */
  readonly id: number;

  /** Name. */
  readonly name: string;

  /** Character. */
  readonly character: string;

  /** Profile path. */
  readonly profilePath: string | null;

  /** Order. */
  readonly order: number;
}

/** Crew. */
export interface Crew {

  /** Id. */
  readonly id: number;

  /** Name. */
  readonly name: string;

  /** Job. */
  readonly job: string;

  /** Department. */
  readonly department: string;

  /** Profile path. */
  readonly profilePath: string | null;
}

/** Credits. */
export interface Credits {

  /** Cast. */
  readonly cast: readonly Cast[];

  /** Crew. */
  readonly crew: readonly Crew[];
}
