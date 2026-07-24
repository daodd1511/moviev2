import { useId } from 'react';
import { useAtom } from 'jotai';

import { SORT_OPTIONS } from '@/shared/constants/sort';
import { queryParamsAtom } from '@/stores/atoms/queryParamsAtom';
import { SortBy, SortOrder } from '@/shared/enums/sort';

export const Sort = () => {
  const selectId = useId();
  const [queryParams, setQueryParams] = useAtom(queryParamsAtom);

  const onSortChange = (sortValue: { sortBy: SortBy; sortOrder: SortOrder; }) => {
    setQueryParams({ ...queryParams, sortBy: sortValue.sortBy, sortOrder: sortValue.sortOrder });
  };
  return (
    <div>
      <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-muted-foreground">
        Sort
      </label>
      <select
        id={selectId}
        className="w-full rounded-md border border-input bg-surface p-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        onChange={e => onSortChange(JSON.parse(e.target.value))}
      >
        {SORT_OPTIONS.map(option => (
          <option key={option.display} value={JSON.stringify(option.value)}>{option.display}</option>
        ))}
      </select>
    </div>
  );
};
