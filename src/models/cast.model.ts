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
}

/** Credits . */
export interface Credits {

  /** Cast. */
  readonly cast: readonly Cast[];

  /** Crew. */
  readonly crew: readonly Cast[];
}
