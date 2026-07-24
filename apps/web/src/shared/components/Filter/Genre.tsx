import { useId } from 'react';
import Select, { StylesConfig } from 'react-select';
import makeAnimated from 'react-select/animated';

import { FilterProps } from '.';

import { MediaType } from '@/shared/enums/mediaType';
import { MovieQueries } from '@/stores/queries/movieQueries';
import { TvQueries } from '@/stores/queries/tvQueries';

const animatedComponents = makeAnimated();

interface GenreOption {

  /** Genre id. */
  readonly value: number;

  /** Genre name. */
  readonly label: string;
}

// react-select@5.7.2's own StylesConfig type predates the csstype version
// pulled in transitively now; its CSSObjectWithLabel no longer structurally
// matches plain style objects (e.g. accentColor's union widened). The values
// below are plain, valid CSS — only the library's stale generic type is
// being satisfied here, via a single boundary cast.
const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'var(--color-surface)',
    borderColor: state.isFocused ? 'var(--color-ring)' : 'var(--color-border)',
    borderRadius: '0.75rem',
    boxShadow: state.isFocused ? '0 0 0 3px color-mix(in srgb, var(--color-ring) 50%, transparent)' : 'none',
    '&:hover': { borderColor: 'var(--color-ring)' },
  }),
  menu: base => ({
    ...base,
    backgroundColor: 'var(--color-popover)',
    border: '1px solid var(--color-border)',
    borderRadius: '0.75rem',
    overflow: 'hidden',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? 'var(--color-accent)' : 'transparent',
    color: 'var(--color-popover-foreground)',
    cursor: 'pointer',
  }),
  multiValue: base => ({ ...base, backgroundColor: 'var(--color-secondary)', borderRadius: '9999px' }),
  multiValueLabel: base => ({ ...base, color: 'var(--color-secondary-foreground)' }),
  multiValueRemove: base => ({
    ...base,
    color: 'var(--color-muted-foreground)',
    borderRadius: '9999px',
    ':hover': { backgroundColor: 'var(--color-destructive)', color: 'var(--color-destructive-foreground)' },
  }),
  singleValue: base => ({ ...base, color: 'var(--color-foreground)' }),
  input: base => ({ ...base, color: 'var(--color-foreground)' }),
  placeholder: base => ({ ...base, color: 'var(--color-muted-foreground)' }),
  indicatorSeparator: base => ({ ...base, backgroundColor: 'var(--color-border)' }),
  dropdownIndicator: base => ({ ...base, color: 'var(--color-muted-foreground)' }),
  clearIndicator: base => ({ ...base, color: 'var(--color-muted-foreground)' }),
} as StylesConfig<GenreOption, true>;

export const Genre = ({ type }: Pick<FilterProps, 'type'>) => {
  const selectId = useId();
  const {
    data: genres,
  } = type === MediaType.Movie ? MovieQueries.useGenres() : TvQueries.useGenres();
  const transformedGenres: GenreOption[] | undefined = genres?.map(genre => ({
    value: genre.id,
    label: genre.name,
  }));
  return (
    <div className="min-w-[16rem] max-w-xs">
      <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-muted-foreground">
        Genres
      </label>
      <Select
        inputId={selectId}
        closeMenuOnSelect={false}
        components={animatedComponents}
        isMulti
        options={transformedGenres}
        styles={selectStyles}
      />
    </div>
  );
};
