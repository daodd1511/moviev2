import { PersonCombinedCreditsDto, CombinedCreditDto } from '@/api/dtos/person/personCombinedCredits.dto';

import { PersonCombinedCredits, CombinedCredit } from '@/models';

export namespace PersonCombinedCreditsMapper {

  /**
   * Maps PersonCombinedCreditsDto to PersonCombinedCredits model.
   * @param dto Person combined credits dto.
   */
  export function fromDto(dto: PersonCombinedCreditsDto): PersonCombinedCredits {
    return {
      id: dto.id,
      cast: dto.cast.map(credit => mapCombinedCredit(credit)),
      crew: dto.crew.map(credit => mapCombinedCredit(credit)),
    };
  }

  /**
   * Maps CombinedCreditDto to CombinedCredit model.
   * @param dto Combined credit dto.
   */
  function mapCombinedCredit(dto: CombinedCreditDto): CombinedCredit {
    return {
      id: dto.id,
      originalLanguage: dto.original_language,
      episodeCount: dto.episode_count,
      overview: dto.overview,
      originCountry: dto.origin_country,
      originalName: dto.original_name,
      voteCount: dto.vote_count,
      name: dto.name,
      mediaType: dto.media_type,
      popularity: dto.popularity,
      creditId: dto.credit_id,
      backdropPath: dto.backdrop_path,
      firstAirDate: dto.first_air_date,
      voteAverage: dto.vote_average,
      genreIds: dto.genre_ids,
      posterPath: dto.poster_path,
      originalTitle: dto.original_title,
      video: dto.video,
      title: dto.title,
      adult: dto.adult,
      releaseDate: dto.release_date,
      character: dto.character,
      gender: dto.gender,
      job: dto.job,
    };
  }
}
