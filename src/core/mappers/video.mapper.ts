import { Video } from '../../core/models';
import { VideoDto } from '../../core/dtos';

export namespace VideoMapper {

  /**
   * Maps Dto to model.
   * @param dto Dto.
   */
  export function fromDto(dto: VideoDto): Video {
    return new Video({
      id: dto.id,
      type: dto.type,
      key: dto.key,
    });
  }
}
