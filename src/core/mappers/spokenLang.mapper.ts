import { SpokenLanguageDto } from '../dtos/spokenLang.dto';
import { SpokenLanguage } from '../models/spokenLang.model';

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
