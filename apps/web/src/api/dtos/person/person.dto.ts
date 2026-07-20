/** Person DTO. */
export interface PersonDto {

  /** Id. */
  readonly id: number;

  /** Name. */
  readonly name: string;

  /** Biography. */
  readonly biography: string;

  /** Birthday. */
  readonly birthday: string | null;

  /** Deathday. */
  readonly deathday: string | null;

  /** Place of birth. */
  readonly place_of_birth: string | null;

  /** Profile path. */
  readonly profile_path: string | null;

  /** Popularity. */
  readonly popularity: number;

  /** Known for department. */
  readonly known_for_department: string;
}
