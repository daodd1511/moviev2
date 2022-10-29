import { SpokenLanguageDto } from '../dtos';

import { SpokenLanguage } from '../../models';

export namespace SpokenLangMapper {

  /**
   * Maps Dto to model.
   * @param dto Dto.
   */
  export function fromDto(dto: SpokenLanguageDto): SpokenLanguage {
    return new SpokenLanguage({
      iso: dto.iso_639_1,
      name: dto.name,
    });
  }
}
