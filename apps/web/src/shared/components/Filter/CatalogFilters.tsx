import { useId } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CatalogMediaType } from '@/models/catalog-query.model';

const DEFAULT_SORT = 'default';

export const CatalogFilters = ({ mediaType }: { readonly mediaType: CatalogMediaType }) => {
  const sortId = useId();
  const genresId = useId();
  const yearId = useId();
  const ratingId = useId();
  const [params, setParams] = useSearchParams();
  const setValue = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value === '') next.delete(key);
    else next.set(key, value);
    next.delete('page');
    setParams(next);
  };
  const reset = () => setParams({});
  return (
    <section aria-label={`${mediaType} catalog filters`} className="mt-5 flex flex-wrap gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor={sortId}>Sort</Label>
        <Select
          value={params.get('sort') ?? DEFAULT_SORT}
          onValueChange={value => setValue('sort', value === DEFAULT_SORT ? '' : value)}
        >
          <SelectTrigger id={sortId}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={DEFAULT_SORT}>Default</SelectItem>
            <SelectItem value="popularity.desc">Popularity</SelectItem>
            <SelectItem value="vote_average.desc">Rating</SelectItem>
            <SelectItem value="primary_release_date.desc">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={genresId}>Genres</Label>
        <Input
          id={genresId}
          value={params.get('genres') ?? ''}
          onChange={event => setValue('genres', event.target.value)}
          placeholder="28,12"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={yearId}>Year</Label>
        <Input
          id={yearId}
          type="number"
          value={params.get('year') ?? ''}
          onChange={event => setValue('year', event.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={ratingId}>Minimum rating</Label>
        <Input
          id={ratingId}
          type="number"
          min="0"
          max="10"
          step="1"
          value={params.get('rating') ?? ''}
          onChange={event => setValue('rating', event.target.value)}
        />
      </div>
      <Button type="button" variant="outline" onClick={reset} className="self-end">
        Reset filters
      </Button>
    </section>
  );
};
