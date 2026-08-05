import { useId } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ComboBox } from '@/shared/components/ui/ComboBox';
import { MultiSelect } from '@/shared/components/ui/MultiSelect';
import type { CatalogMediaType } from '@/models/catalog-query.model';
import { CatalogQueries } from '@/stores/queries/catalogQueries';

const DEFAULT_SORT = 'default';
const ANY_RATING = 'any';
const RATING_STEPS = [9, 8, 7, 6, 5] as const;
const EARLIEST_YEAR = 1900;

/** Release years offered by the Year filter, newest first. */
const YEAR_OPTIONS = Array.from(
  { length: new Date().getFullYear() - EARLIEST_YEAR + 1 },
  (_, index) => String(new Date().getFullYear() - index),
).map(year => ({ value: year, label: year }));

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
  const hasFilters = [...params.keys()].length > 0;

  return (
    <section
      aria-label={`${mediaType} catalog filters`}
      className="mt-6 rounded-xl border border-foreground/10 bg-surface/40 p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Refine
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!hasFilters}
          className="text-muted-foreground hover:text-foreground"
          onClick={reset}
        >
          Reset filters
        </Button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field>
          <FieldLabel htmlFor={sortId}>Sort</FieldLabel>
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
        </Field>

        <Field>
          <FieldLabel id={genresId}>Genres</FieldLabel>
          <MultiSelect
            labelledBy={genresId}
            options={genres.map(genre => ({ value: String(genre.id), label: genre.name }))}
            selected={selectedGenres}
            onChange={values => setValue('genres', values.join(','))}
            placeholder="Any genre"
          />
        </Field>

        <Field>
          <FieldLabel id={yearId}>Year</FieldLabel>
          <ComboBox
            labelledBy={yearId}
            options={YEAR_OPTIONS}
            value={(params.get(dateGteKey) ?? '').slice(0, 4) || null}
            onChange={year => setYear(year ?? '')}
            placeholder="Any year"
            searchPlaceholder="Search years…"
            emptyMessage="No matching years."
          />
        </Field>

        <Field>
          <FieldLabel htmlFor={ratingId}>Minimum rating</FieldLabel>
          <Select
            value={params.get('vote_average.gte') ?? ANY_RATING}
            onValueChange={value => setValue('vote_average.gte', value === ANY_RATING ? '' : value)}
          >
            <SelectTrigger id={ratingId}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY_RATING}>Any rating</SelectItem>
              {RATING_STEPS.map(step => (
                <SelectItem key={step} value={String(step)}>
                  {step}+
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
    </section>
  );
};
