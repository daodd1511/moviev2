import { describe, expect, it } from 'vitest';

import { SeasonDetailMapper } from './seasonDetail.mapper';

import { SeasonDetailDto } from '@/api/dtos';

const season: SeasonDetailDto = {
  air_date: '2023-01-15',
  episodes: [
    {
      air_date: '2023-01-15',
      episode_number: 1,
      id: 101,
      name: 'First episode',
      overview: 'The first episode.',
      runtime: 81,
      still_path: '/episode-one.jpg',
      vote_average: 8.3,
    },
    {
      air_date: '2023-01-22',
      episode_number: 2,
      id: 102,
      name: 'Second episode',
      overview: 'The second episode.',
      runtime: 53,
      still_path: '/episode-two.jpg',
      vote_average: 8.4,
    },
  ],
  id: 10,
  name: 'Season 1',
  overview: 'The first season.',
  poster_path: '/season.jpg',
  season_number: 1,
};

describe('SeasonDetailMapper.fromDto', () => {
  it('maps season metadata and preserves episode order', () => {
    const result = SeasonDetailMapper.fromDto(season);

    expect(result).toMatchObject({
      airDate: '2023-01-15',
      id: 10,
      name: 'Season 1',
      overview: 'The first season.',
      posterPath: '/season.jpg',
      seasonNumber: 1,
    });
    expect(result.episodes.map(episode => episode.id)).toEqual([101, 102]);
  });
});
