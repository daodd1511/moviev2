import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { Seasons } from './Seasons';

import { Season } from '@/models';

const seasons = [
  new Season({
    id: 10,
    airDate: '2023-01-01',
    episodeCount: 2,
    name: 'Specials',
    overview: '',
    posterPath: null,
    seasonNumber: 0,
  }),
  new Season({
    id: 11,
    airDate: '2023-01-15',
    episodeCount: 9,
    name: 'Season 1',
    overview: '',
    posterPath: '/season-one.jpg',
    seasonNumber: 1,
  }),
];

describe('Seasons', () => {
  it('links numbered seasons and Specials to their dedicated season routes', () => {
    render(
      <MemoryRouter>
        <Seasons tvId={42} seasons={seasons} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Open Specials' })).toHaveAttribute(
      'href',
      '/tv/42/season/0',
    );
    expect(screen.getByRole('link', { name: 'Open Season 1' })).toHaveAttribute(
      'href',
      '/tv/42/season/1',
    );
  });
});
