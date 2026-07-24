import { Immerable, OmitImmerable } from './immerable';

/** Video. */
export class Video extends Immerable {
  /** Id. */
  public readonly id: string;

  /** Key. */
  public readonly key: string;

  /** Type. */
  public readonly type: string;

  /** Display name. */
  public readonly name: string;

  /** Video provider. */
  public readonly site: string;

  /** Whether the video is official. */
  public readonly official: boolean;

  /** Publication timestamp. */
  public readonly publishedAt: string;

  public constructor(data: InitArgsVideo) {
    super();
    this.id = data.id;
    this.key = data.key;
    this.type = data.type;
    this.name = data.name;
    this.site = data.site;
    this.official = data.official;
    this.publishedAt = data.publishedAt;
  }
}
type InitArgsVideo = OmitImmerable<Video>;
