import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';

import { MovieService } from '../../../api/services/movieService';
import { DISCOVER } from '../../../core/constants';

import { Type } from '../../../core/enums';
import { Genre } from '../../../core/models';

interface Props {

  /** Watch type. */
  readonly type: Type;
}

const SidebarComponent = ({ type }: Props) => {
  const navigate = useNavigate();
  const {
    data: genres,
    isLoading,
    isError,
    error,
  } = useQuery<readonly Genre[], AxiosError>(['genres', type], () =>
    MovieService.getGenres(type));

  const onDiscoverClick = (value: string) => {
    navigate(`/${type}/${value}`);
  };

  const onGenreClick = (genre: Genre) => {
    navigate(`/genre/${genre.id}`);
  };

  if (isLoading) {
    return <div>Genres Loading...</div>;
  }

  if (isError) {
    return <div>Genres Error: {error.message}</div>;
  }

  return (
    <aside className="p-6">
      <h1 className="text-2xl">Dao movies</h1>
      <h2 className="text-xl">Discover</h2>
      <div className="flex flex-col">
        {DISCOVER.map(item => (
          <button
            className="text-left"
            type="button"
            key={item.value}
            onClick={() => onDiscoverClick(item.value)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <h2 className="text-xl">Genres</h2>
      <div className="flex flex-col">
        {genres.map(genre => (
          <button
            className="text-left"
            type="button"
            key={genre.id}
            onClick={() => onGenreClick(genre)}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </aside>
  );
};

export const Sidebar = memo(SidebarComponent);
