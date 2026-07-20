import { memo } from 'react';

import { Sort } from './Sort';
import { Genre } from './Genre';

import { MediaType } from '@/shared/enums/mediaType';

/** Filter props. */
export interface FilterProps {

  /** Media type. */
  readonly type: MediaType;
}

const FilterComponent = ({ type }: FilterProps) => (
  <>
    <div className="px-8 pt-12 flex gap-8">
      <Sort />
      <Genre type={type}/>
    </div>
  </>
);

export const Filter = memo(FilterComponent);
