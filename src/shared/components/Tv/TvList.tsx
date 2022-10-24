import { memo } from 'react';

import { Tv } from '../../../core/models/tv/tv.model';

import { TvListItem } from './TvListItem';

interface Props {

  /** Tvs data. */
  readonly tvs: readonly Tv[];
}

const TvListComponent = ({ tvs }: Props) => (
  <div className="grid grid-cols-autoFit gap-x-6 gap-y-10 place-content-evenly pb-10">
    {tvs.map(tv =>
      <div key={tv.id}>
        <TvListItem tv={tv} />
      </div>)}
  </div>
);

export const TvList = memo(TvListComponent);
