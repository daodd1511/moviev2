import { Immerable, OmitImmerable } from '../immerable';

/** Video. */
export class Video extends Immerable {
  /** Id. */
  public readonly id: string;

  /** Key. */
  public readonly key: string;

  /** Type. */
  public readonly type: string;

  public constructor(data: InitArgsVideo) {
    super();
    this.id = data.id;
    this.key = data.key;
    this.type = data.type;
  }
}
type InitArgsVideo = OmitImmerable<Video>;
