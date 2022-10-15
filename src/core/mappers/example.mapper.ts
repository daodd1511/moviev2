import { Anime, AnimeStatus, AnimeType } from '../models/anime/anime';

import { AnimeDto, AnimeStatusDto, AnimeTypeDto } from '../dtos/anime/anime.dto';

import { DateRangeMapper } from '../dateRange.mapper';

export const ANIME_STATUS_FROM_DTO_MAP: Readonly<Record<AnimeStatusDto, AnimeStatus>> = {
  [AnimeStatusDto.Airing]: AnimeStatus.Airing,
  [AnimeStatusDto.Finished]: AnimeStatus.Finished,
  [AnimeStatusDto.NotYetAired]: AnimeStatus.NotYetAired,
};

export const ANIME_TYPE_FROM_DTO_MAP: Readonly<Record<AnimeTypeDto, AnimeType>> = {
  [AnimeTypeDto.Movie]: AnimeType.Movie,
  [AnimeTypeDto.Music]: AnimeType.Music,
  [AnimeTypeDto.Ona]: AnimeType.Ona,
  [AnimeTypeDto.Ova]: AnimeType.Ova,
  [AnimeTypeDto.Special]: AnimeType.Special,
  [AnimeTypeDto.Tv]: AnimeType.Tv,
};

export namespace AnimeMapper {

  /**
   * Maps AnimeDto to Anime model.
   * @param dto Anime dto.
   */
  export function fromDto(dto: AnimeDto): Anime {
    return new Anime({
      id: dto.id,
      image: dto.image,
      englishTitle: dto.title_eng,
      japaneseTitle: dto.title_jpn,
      aired: DateRangeMapper.fromDto(dto.aired),
      type: ANIME_TYPE_FROM_DTO_MAP[dto.type],
      status: ANIME_STATUS_FROM_DTO_MAP[dto.status],
    });
  }
}
