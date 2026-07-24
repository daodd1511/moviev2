import { useId } from 'react';
import { useAtom } from 'jotai';
import { ArrowDownWideNarrow } from 'lucide-react';

import { SORT_OPTIONS } from '@/shared/constants/sort';
import { queryParamsAtom } from '@/stores/atoms/queryParamsAtom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const Sort = () => {
  const labelId = useId();
  const [queryParams, setQueryParams] = useAtom(queryParamsAtom);
  const selectedIndex = String(SORT_OPTIONS.findIndex(option =>
    option.value.sortBy === queryParams.sortBy &&
    option.value.sortOrder === queryParams.sortOrder));

  const onValueChange = (index: string) => {
    const option = SORT_OPTIONS[Number(index)];
    setQueryParams({
      ...queryParams,
      sortBy: option.value.sortBy,
      sortOrder: option.value.sortOrder,
    });
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 md:max-w-72">
      <span id={labelId} className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        <ArrowDownWideNarrow aria-hidden="true" className="size-3.5" />
        Sort by
      </span>
      <Select value={selectedIndex} onValueChange={onValueChange}>
        <SelectTrigger aria-labelledby={labelId}>
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent position="popper" align="start" sideOffset={6}>
          {SORT_OPTIONS.map((option, index) => (
            <SelectItem key={option.display} value={String(index)}>
              {option.display}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
