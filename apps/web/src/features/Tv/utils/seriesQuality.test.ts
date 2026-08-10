import { describe, expect, it } from 'vitest';

import {
  buildEpisodeMatrix,
  calculateEpisodeAverage,
  getQualityBand,
  QUALITY_BANDS,
} from './seriesQuality';

import { Episode, SeasonDetail } from '@/models';

const episode = (episodeNumber: number, voteAverage: number | null): Episode =>
  new Episode({
    id: episodeNumber,
    airDate: '2026-08-03',
    episodeNumber,
    name: `Episode ${episodeNumber}`,
    overview: '',
    runtime: null,
    stillPath: null,
    voteAverage,
  });

const season = (seasonNumber: number, episodes: readonly Episode[]): SeasonDetail =>
  new SeasonDetail({
    id: seasonNumber,
    airDate: null,
    episodes,
    name: `Season ${seasonNumber}`,
    overview: '',
    posterPath: null,
    seasonNumber,
  });

describe('getQualityBand', () => {
  it.each([
    [9, 'awesome'],
    [8.9, 'great'],
    [8, 'great'],
    [7.9, 'good'],
    [7, 'good'],
    [6.9, 'regular'],
    [6, 'regular'],
    [5.9, 'bad'],
    [5, 'bad'],
    [4.9, 'garbage'],
    [null, 'notRated'],
  ] as const)('maps %s to %s at fixed band boundaries', (voteAverage, qualityBand) => {
    expect(getQualityBand(voteAverage)).toBe(qualityBand);
  });

  it('exposes the agreed band labels and thresholds', () => {
    expect(QUALITY_BANDS).toEqual({
      awesome: { label: 'Awesome', minimum: 9 },
      great: { label: 'Great', minimum: 8 },
      good: { label: 'Good', minimum: 7 },
      regular: { label: 'Regular', minimum: 6 },
      bad: { label: 'Bad', minimum: 5 },
      garbage: { label: 'Garbage', minimum: Number.NEGATIVE_INFINITY },
    });
  });
});

describe('series quality calculations', () => {
  it('builds rated, unrated, and nonexistent matrix positions', () => {
    const firstSeason = season(1, [episode(1, 8.4), episode(2, null)]);
    const secondSeason = season(2, [episode(1, 7.2), episode(3, 9.1)]);

    expect(buildEpisodeMatrix([firstSeason, secondSeason])).toEqual([
      {
        episodeNumber: 1,
        cells: [
          { episode: firstSeason.episodes[0], kind: 'rated', voteAverage: 8.4 },
          { episode: secondSeason.episodes[0], kind: 'rated', voteAverage: 7.2 },
        ],
      },
      {
        episodeNumber: 2,
        cells: [{ episode: firstSeason.episodes[1], kind: 'notRated' }, { kind: 'nonexistent' }],
      },
      {
        episodeNumber: 3,
        cells: [
          { kind: 'nonexistent' },
          { episode: secondSeason.episodes[1], kind: 'rated', voteAverage: 9.1 },
        ],
      },
    ]);
  });

  it('calculates an average from every supplied regular or Specials episode', () => {
    const regularSeason = season(1, [episode(1, 8), episode(2, null)]);
    const specials = season(0, [episode(1, 10)]);

    expect(calculateEpisodeAverage([regularSeason])).toBe(8);
    expect(calculateEpisodeAverage([regularSeason, specials])).toBe(9);
  });

  it('returns empty matrix and average results without rated episodes', () => {
    expect(buildEpisodeMatrix([])).toEqual([]);
    expect(calculateEpisodeAverage([])).toBeNull();
    expect(calculateEpisodeAverage([season(1, [episode(1, null)])])).toBeNull();
  });
});
