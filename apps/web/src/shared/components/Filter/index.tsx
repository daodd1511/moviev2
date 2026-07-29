import { memo } from 'react';
import { SlidersHorizontal } from 'lucide-react';

import { Sort } from './Sort';
import { Genre } from './Genre';

import { MediaType } from '@/shared/enums/mediaType';

/** Filter props. */
export interface FilterProps {
  /** Media type. */
  readonly type: MediaType;
}

const FilterComponent = ({ type }: FilterProps) => (
  <section
    aria-label="Browse filters"
    className="mx-5 mt-8 rounded-lg border border-foreground/10 bg-surface/70 p-4 shadow-[0_20px_48px_-28px_rgba(0,0,0,0.7)] backdrop-blur-sm md:mx-8 md:flex md:items-end md:gap-8 md:p-5"
  >
    <div className="mb-4 flex items-center gap-3 md:mb-0 md:self-center md:pr-2">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.06]">
        <SlidersHorizontal aria-hidden="true" className="size-4 text-muted-foreground" />
      </span>
      <div>
        <p className="text-sm font-medium text-foreground">Refine</p>
        <p className="text-xs text-muted-foreground">Find your next watch</p>
      </div>
    </div>
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row">
      <Sort />
      <Genre type={type} />
    </div>
  </section>
);

export const Filter = memo(FilterComponent);
