import { describe, expect, it } from 'vitest';

import { EpisodeMapper } from './episode.mapper';

import { EpisodeDto } from '@/api/dtos';

const completeEpisode: EpisodeDto = {
  air_date: '2023-01-15',
  episode_number: 1,
  id: 101,
  name: 'When You Are Lost in the Darkness',
  overview: 'Joel is asked to escort Ellie out of the quarantine zone.',
  runtime: 81,
  still_path: '/still.jpg',
  vote_average: 8.3,
};

describe('EpisodeMapper.fromDto', () => {
  it('maps complete episode metadata', () => {
    expect(EpisodeMapper.fromDto(completeEpisode)).toMatchObject({
      airDate: '2023-01-15',
      episodeNumber: 1,
      id: 101,
      name: 'When You Are Lost in the Darkness',
      overview: 'Joel is asked to escort Ellie out of the quarantine zone.',
      runtime: 81,
      stillPath: '/still.jpg',
      voteAverage: 8.3,
    });
  });

  it('normalizes absent metadata and a non-positive vote average', () => {
    const episode = EpisodeMapper.fromDto({
      ...completeEpisode,
      air_date: null,
      runtime: null,
      still_path: null,
      vote_average: 0,
    });

    expect(episode).toMatchObject({
      airDate: null,
      runtime: null,
      stillPath: null,
      voteAverage: null,
    });
  });
});
