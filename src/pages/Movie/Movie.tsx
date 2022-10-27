import { memo, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { AxiosError } from 'axios';

import { Modal } from '../../shared/components/Modal';
import { MovieDetail } from '../../core/models';
import { MovieService } from '../../api/services/movieService';
import { Spinner } from '../../shared/components';
import { API_CONFIG } from '../../api/config';
import { PosterSizes } from '../../core/enums';
import { IMAGE_BASE_URL } from '../../core/constants';
import { goToTop, assertNonNull } from '../../core/utils';

import { Content } from './components/Content';
import { Recommend } from './components/Recommend';

const MovieComponent = () => {
  const { id } = useParams();
  assertNonNull(id, 'Movie id is null');
  const movieId = parseInt(id, 10);
  const [isWatchMovie, setIsWatchMovie] = useState(false);
  const [isFullSizeImage, setIsFullSizeImage] = useState(false);
  const {
    data: movie,
    isLoading,
    isError,
    error,
  } = useQuery<MovieDetail, AxiosError>(['movie', movieId], () =>
    MovieService.getMovieDetail(movieId));
  const videoSource =
    id !== undefined ? `${API_CONFIG.videoApiUrl}movie?id=${id}` : null;

  useEffect(() => {
      goToTop();
    }, [id]);
  if (isLoading) {
    return (
      <div className="h-screen w-screen">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  const imageURL =
    movie.posterPath != null ?
      `${IMAGE_BASE_URL}${PosterSizes.extraExtraLarge}${movie.posterPath}` :
      '/images/no-image.png';
      const fullSizeImageUrl = movie.posterPath !== null ?
        `${IMAGE_BASE_URL}${PosterSizes.original}${movie.posterPath}` :
        '/images/no-image.png';
  return (
    <div className="p-10">
      <div className="m-auto flex max-w-screen-xl">
        <div className="max-w-[40%] p-10">
          <img
            src={imageURL}
            alt={`${movie.title} image`}
            className="max-w-full rounded-xl shadow-2xl cursor-zoom-in"
            onClick={() => setIsFullSizeImage(true)}
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
          <Content movie={movie} />
        </div>
      </div>
      <Recommend movieId={movie.id} />
      {isWatchMovie && videoSource !== null && (
        <Modal setIsOpen={setIsWatchMovie}>
          <div className="z-50 w-5/6">
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
      {isFullSizeImage && fullSizeImageUrl !== null && (
        <Modal setIsOpen={setIsFullSizeImage}>
          <img src={fullSizeImageUrl} alt="full size image" className="h-[95vh]" />
        </Modal>
      )}
    </div>
  );
};

export const Movie = memo(MovieComponent);
