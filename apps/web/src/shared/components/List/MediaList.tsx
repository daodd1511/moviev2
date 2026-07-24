import { memo } from 'react';

import { MediaListItem } from './MediaListItem';

import { Media } from '@/models';

interface Props {

  /** Film data. */
  readonly data: readonly Media[];
}

const MediaListComponent = ({ data }: Props) => (
  <div className="grid grid-cols-2 gap-x-3 gap-y-6 pb-8 sm:grid-cols-autoFit sm:place-content-evenly sm:gap-x-6 sm:gap-y-10 sm:pb-10">
    {data.length === 0 && <p className="text-center">No results found!</p>}
    {data.map(item => (
      <MediaListItem media={item} key={`${item.type}:${item.id}`} />
    ))}
  </div>
);

export const MediaList = memo(MediaListComponent);
