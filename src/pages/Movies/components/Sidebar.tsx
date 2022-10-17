import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { MovieService } from '../../../api/services/movieService';
import { DISCOVER } from '../../../core/constants';
import { Spinner } from '../../../shared/components';
import { Type } from '../../../core/enums';
import { Genre } from '../../../core/models';

interface Props {

  /** Watch type. */
  readonly type: Type;
}

const SidebarComponent = ({ type }: Props) => {
  const navigate = useNavigate();
  const { discover, genreId } = useParams();
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
    navigate(`/${type}/genre/${genre.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return <div>Genres Error: {error.message}</div>;
  }

  return (
    <aside className="w-60 p-6">
      <h1 className="pb-10 text-2xl">Dao movies</h1>
      {/* Discover */}
      <div className="pb-8">
        <h2 className="pb-4 font-medium">Discover</h2>
        <div className="flex flex-col">
          {DISCOVER.map(item => (
            <button
              className={`my-1 rounded-full border px-4 py-2 text-left text-sm font-medium text-gray-400 
              ${
                discover !== undefined && discover === item.value ?
                  'border-black text-black' :
                  'border-transparent hover:border-gray-400'
              } `}
              type="button"
              key={item.value}
              onClick={() => onDiscoverClick(item.value)}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
      {/* Genre */}
      <div className="pb-8">
        <h2 className="pb-4 font-medium">Genres</h2>
        <div className="flex flex-col">
          {genres.map(genre => (
            <button
              className={`my-1 rounded-full border px-4 py-2 text-left text-sm font-medium text-gray-400  
              ${
                genreId !== undefined && genreId === genre.id.toString() ?
                  'border-black text-black' :
                  'border-transparent hover:border-gray-400'
              }`}
              type="button"
              key={genre.id}
              onClick={() => onGenreClick(genre)}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export const Sidebar = memo(SidebarComponent);
