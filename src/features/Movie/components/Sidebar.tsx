import { memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Loader } from '@/shared/components';
import { Type } from '@/shared/enums';
import { Genre } from '@/models';
import { MovieQueries } from '@/stores/queries/movieQueries';

interface Props {

  /** Watch type. */
  readonly type: Type;
}

const SidebarComponent = ({ type }: Props) => {
  const navigate = useNavigate();
  const { genreId } = useParams();
  const {
    data: genres,
    isLoading,
    isError,
    error,
  } = MovieQueries.useGenres();

  const onGenreClick = (genre: Genre) => {
    navigate(`/${type}/genre/${genre.id}`);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <div>Genres Error: {error.message}</div>;
  }

  return (
    <aside className="w-60 p-6">
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
