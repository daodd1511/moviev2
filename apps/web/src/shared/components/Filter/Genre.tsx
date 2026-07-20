import Select from 'react-select';
import makeAnimated from 'react-select/animated';

import { FilterProps } from '.';

import { MediaType } from '@/shared/enums/mediaType';
import { MovieQueries } from '@/stores/queries/movieQueries';
import { TvQueries } from '@/stores/queries/tvQueries';

const animatedComponents = makeAnimated();

export const Genre = ({ type }: Pick<FilterProps, 'type'>) => {
    const {
        data: genres,
    } = type === MediaType.Movie ? MovieQueries.useGenres() : TvQueries.useGenres();
    const transformedGenres = genres?.map(genre => ({
        value: genre.id,
        label: genre.name,
    }));
    return (
      <div className="max-w-xs min-w-">
        <label className="label">Genres</label>
        <Select
          closeMenuOnSelect={false}
          components={animatedComponents}
          isMulti
          options={transformedGenres}
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        />
      </div>
    );
};
