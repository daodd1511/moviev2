/** Person model. */
export class Person {
  /** Id. */
  public readonly id: number;

  /** Name. */
  public readonly name: string;

  /** Biography. */
  public readonly biography: string;

  /** Birthday. */
  public readonly birthday: string | null;

  /** Deathday. */
  public readonly deathday: string | null;

  /** Place of birth. */
  public readonly place_of_birth: string | null;

  /** Profile path. */
  public readonly profilePath: string | null;

  /** Popularity. */
  public readonly popularity: number;

  /** Known for department. */
  public readonly knownForDepartment: string;

  public constructor(data: Person) {
    this.id = data.id;
    this.name = data.name;
    this.biography = data.biography;
    this.birthday = data.birthday;
    this.deathday = data.deathday;
    this.place_of_birth = data.place_of_birth;
    this.profilePath = data.profilePath;
    this.popularity = data.popularity;
    this.knownForDepartment = data.knownForDepartment;
  }
}
