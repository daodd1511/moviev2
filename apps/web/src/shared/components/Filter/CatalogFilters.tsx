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
import { MultiSelect } from '@/shared/components/ui/MultiSelect';
import type { CatalogMediaType } from '@/models/catalog-query.model';
import { CatalogQueries } from '@/stores/queries/catalogQueries';

const DEFAULT_SORT = 'default';

export const CatalogFilters = ({ mediaType }: { readonly mediaType: CatalogMediaType }) => {
  const sortId = useId();
  const genresId = useId();
  const yearId = useId();
  const ratingId = useId();
  const [params, setParams] = useSearchParams();
  const { data: genres = [] } = CatalogQueries.useGenres(mediaType);

  const dateGteKey = mediaType === 'movie' ? 'primary_release_date.gte' : 'first_air_date.gte';
  const dateLteKey = mediaType === 'movie' ? 'primary_release_date.lte' : 'first_air_date.lte';

  const setValue = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value === '') next.delete(key);
    else next.set(key, value);
    setParams(next);
  };
  const setYear = (value: string) => {
    const next = new URLSearchParams(params);
    if (value === '') {
      next.delete(dateGteKey);
      next.delete(dateLteKey);
    } else {
      next.set(dateGteKey, `${value}-01-01`);
      next.set(dateLteKey, `${value}-12-31`);
    }
    setParams(next);
  };
  const reset = () => setParams({});

  const selectedGenres = (params.get('genres') ?? '').split(',').filter(Boolean);

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
      <div className="grid w-48 gap-1.5">
        <Label id={genresId}>Genres</Label>
        <MultiSelect
          labelledBy={genresId}
          options={genres.map(genre => ({ value: String(genre.id), label: genre.name }))}
          selected={selectedGenres}
          onChange={values => setValue('genres', values.join(','))}
          placeholder="Any genre"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={yearId}>Year</Label>
        <Input
          id={yearId}
          type="number"
          value={(params.get(dateGteKey) ?? '').slice(0, 4)}
          onChange={event => setYear(event.target.value)}
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
          value={params.get('vote_average.gte') ?? ''}
          onChange={event => setValue('vote_average.gte', event.target.value)}
        />
      </div>
      <Button type="button" variant="outline" onClick={reset} className="self-end">
        Reset filters
      </Button>
    </section>
  );
};
