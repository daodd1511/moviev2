import { memo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { AxiosError } from 'axios';

import { Modal } from '../../shared/components/Modal';
import { MovieDetail } from '../../core/models';
import { MovieService } from '../../api/services/movieService';
import { Spinner } from '../../shared/components';
import { API_CONFIG } from '../../api/config';
import { PosterSizes, Type } from '../../core/enums';
import { IMAGE_BASE_URL } from '../../core/constants';

interface Props {

  /** Movie type. */
  readonly type: Type;
}

const MovieComponent = ({ type }: Props) => {
  const { id } = useParams();
  const movieId = id !== undefined ? parseInt(id, 10) : undefined;
  const [isWatchMovie, setIsWatchMovie] = useState(false);
  const {
    data: movie,
    isLoading,
    isError,
    error,
  } = useQuery<MovieDetail, AxiosError>(['movie', movieId], () =>
    MovieService.getMovieDetail(movieId));
  const videoSource =
    id !== undefined ? `${API_CONFIG.videoApiUrl}${type}?id=${id}` : null;

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  const imageURL =
    movie.posterPath != null ?
      `${IMAGE_BASE_URL}${PosterSizes.extraExtraLarge}${movie.posterPath}` :
      '/images/no-image.png';
  return (
    <>
      <div>Movie detail page</div>
      <div className="m-auto flex max-w-screen-xl">
        <div className="max-w-[40%] p-10">
          <img
            src={imageURL}
            alt={`${movie.title} image`}
            className="max-w-full rounded-xl"
          />
          <div>
            <button
              type="button"
              className="mr-2 mb-2 w-full rounded-lg border border-blue-700 px-5 py-2.5 text-center text-sm font-medium text-blue-700 hover:bg-blue-800 hover:text-white"
              onClick={() => setIsWatchMovie(true)}
            >
              Watch movie
            </button>
          </div>
        </div>
        <div className="max-w-[60%] p-10">
          <div className="pb-8">
            <h1 className="mb-2 text-5xl font-extralight text-slate-700">
              {movie.title.toUpperCase()}
            </h1>
            <h2 className="text-lg font-bold text-slate-700">
              {movie.tagline.toUpperCase()}
            </h2>
          </div>
          <div className="pb-8">
            <h3 className="mb-2 text-lg font-medium">Genres</h3>
            <ul>
              {movie.genres.map(genre => (
                <li key={genre.id}>{genre.name}</li>
              ))}
            </ul>
          </div>
          <div className="pb-6">
            <h3 className="mb-2 text-lg font-medium">Synopsys</h3>
            <p className="font-light">{movie.overview}</p>
          </div>
        </div>
      </div>
      <pre>{JSON.stringify(movie, null, 2)}</pre>
      {isWatchMovie && videoSource !== null && (
        <Modal setIsOpen={setIsWatchMovie}>
          <div className="w-5/6 z-50">
            <iframe
              src={videoSource}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen={true}
              className="aspect-video"
            />
          </div>
        </Modal>
      )}
    </>
  );
};

export const Movie = memo(MovieComponent);
