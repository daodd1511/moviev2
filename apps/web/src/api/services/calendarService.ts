import { backendApi } from '..';
export interface CalendarRelease {
  readonly mediaType: 'movie' | 'tv';
  readonly tmdbId: number;
  readonly title: string;
  readonly releaseDate: string | null;
  readonly posterPath: string | null;
}
export const CalendarService = {
  list: async (from: string, to: string, timezone = 'UTC') =>
    (
      await backendApi.get<{ releases: CalendarRelease[] }>('/calendar', {
        params: { from, to, timezone },
      })
    ).data.releases,
};
