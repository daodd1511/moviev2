import { useId, useState } from 'react';
import { Shapes } from 'lucide-react';

import { FilterProps } from '.';

import { MediaType } from '@/shared/enums/mediaType';
import { MovieQueries } from '@/stores/queries/movieQueries';
import { TvQueries } from '@/stores/queries/tvQueries';
import { MultiSelect } from '@/shared/components/ui/MultiSelect';

export const Genre = ({ type }: Pick<FilterProps, 'type'>) => {
  const labelId = useId();
  const [selected, setSelected] = useState<string[]>([]);
  const {
    data: genres,
  } = type === MediaType.Movie ? MovieQueries.useGenres() : TvQueries.useGenres();
  const options = genres?.map(genre => ({
    value: String(genre.id),
    label: genre.name,
  })) ?? [];
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 md:max-w-80">
      <span id={labelId} className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        <Shapes aria-hidden="true" className="size-3.5" />
        Genres
      </span>
      <MultiSelect
        options={options}
        selected={selected}
        onChange={setSelected}
        placeholder="All genres"
        labelledBy={labelId}
      />
    </div>
  );
};
