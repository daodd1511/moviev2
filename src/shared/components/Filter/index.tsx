import { memo } from 'react';

import { Sort } from './Sort';

const FilterComponent = () => (
  <>
    <div className="px-8 py-12">
      <Sort />
    </div>
  </>
);

export const Filter = memo(FilterComponent);
