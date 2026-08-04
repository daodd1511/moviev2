import { useSearchParams } from 'react-router-dom';
import type { CatalogMediaType } from '@/models/catalog-query.model';

export const CatalogFilters = ({ mediaType }: { readonly mediaType: CatalogMediaType }) => {
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
      <label>
        Sort
        <select
          value={params.get('sort') ?? ''}
          onChange={event => setValue('sort', event.target.value)}
        >
          <option value="">Default</option>
          <option value="popularity.desc">Popularity</option>
          <option value="vote_average.desc">Rating</option>
          <option value="primary_release_date.desc">Newest</option>
        </select>
      </label>
      <label>
        Genres
        <input
          value={params.get('genres') ?? ''}
          onChange={event => setValue('genres', event.target.value)}
          placeholder="28,12"
        />
      </label>
      <label>
        Year
        <input
          type="number"
          value={params.get('year') ?? ''}
          onChange={event => setValue('year', event.target.value)}
        />
      </label>
      <label>
        Minimum rating
        <input
          type="number"
          min="0"
          max="10"
          step="1"
          value={params.get('rating') ?? ''}
          onChange={event => setValue('rating', event.target.value)}
        />
      </label>
      <button type="button" onClick={reset}>
        Reset filters
      </button>
    </section>
  );
};
