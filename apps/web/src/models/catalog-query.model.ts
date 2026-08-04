export type CatalogMediaType = 'movie' | 'tv';
export type CatalogSearchType = CatalogMediaType | 'person' | 'multi';

export interface CatalogMedia {
  readonly id: number;
  readonly mediaType: CatalogMediaType;
  readonly title: string;
  readonly overview: string;
  readonly posterPath: string | null;
  readonly backdropPath: string | null;
  readonly releaseDate: string;
  readonly voteAverage: number;
  readonly popularity: number;
}

export interface CatalogPerson {
  readonly id: number;
  readonly mediaType: 'person';
  readonly name: string;
  readonly profilePath: string | null;
  readonly popularity: number;
}

export type CatalogResult = CatalogMedia | CatalogPerson;
export interface CatalogPage {
  readonly page: number;
  readonly totalPages: number;
  readonly results: readonly CatalogResult[];
}
export interface CatalogDiscoverInput {
  readonly mediaType: CatalogMediaType;
  readonly page: number;
  readonly sort_by?: string;
  readonly with_genres?: string;
  readonly 'vote_average.gte'?: number;
  readonly 'primary_release_date.gte'?: string;
  readonly 'primary_release_date.lte'?: string;
  readonly 'first_air_date.gte'?: string;
  readonly 'first_air_date.lte'?: string;
}
