import { Immerable, OmitImmerable } from './immerable';

/** Genre. */
export class Genre extends Immerable {
  /** Genre id. */
  public readonly id: number;

  /** Genre name. */
  public readonly name: string;

  public constructor(data: InitArgsGenre) {
    super();
    this.id = data.id;
    this.name = data.name;
  }
}
type InitArgsGenre = OmitImmerable<Genre>;
