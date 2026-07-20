import { Immerable, OmitImmerable } from './immerable';

/** SpokenLanguage. */
export class SpokenLanguage extends Immerable {
  /** Iso. */
  public readonly iso: string;

  /** Name. */
  public readonly name: string;

  public constructor(data: InitArgsSpokenLanguage) {
    super();
    this.iso = data.iso;
    this.name = data.name;
  }
}
type InitArgsSpokenLanguage = OmitImmerable<SpokenLanguage>;
