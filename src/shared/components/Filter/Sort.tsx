import { useAtom } from 'jotai';

import { SORT_OPTIONS } from '@/shared/constants/sort';
import { queryParamsAtom } from '@/stores/atoms/queryParamsAtom';
import { SortBy, SortOrder } from '@/shared/enums/sort';

export const Sort = () => {
    const [queryParams, setQueryParams] = useAtom(queryParamsAtom);

    const onSortChange = (sortValue: { sortBy: SortBy; sortOrder: SortOrder; }) => {
      setQueryParams({ ...queryParams, sortBy: sortValue.sortBy, sortOrder: sortValue.sortOrder });
    };
    return (
      <div>
        <label className="label">Sort</label>
        <select className="bg-gray-50 border border-gray-300 text-gray-900 mb-6 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " onChange={e => onSortChange(JSON.parse(e.target.value))}>
          {SORT_OPTIONS.map(option => (
            <option key={option.display} value={JSON.stringify(option.value)}>{option.display}</option>
          ))}
        </select>
      </div>
    );
};
