import { memo } from 'react';

import { MediaListItem } from './MediaListItem';

import { Media } from '@/models';

interface Props {

  /** Film data. */
  readonly data: readonly Media[];
}

const MediaListComponent = ({ data }: Props) => (
  <div className="grid grid-cols-autoFit place-content-evenly gap-x-6 gap-y-10 pb-10">
    {data.length === 0 && <p className="text-center">No results found!</p>}
    {data.map(item => <MediaListItem media={item} key={item.id} />)}
  </div>
);

export const MediaList = memo(MediaListComponent);
