import { memo, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { AxiosError } from 'axios';

import { Modal } from '../../shared/components/Modal';
import { MovieDetail } from '../../core/models';
import { MovieService } from '../../api/services/movieService';
import { Spinner } from '../../shared/components';
import { BackdropSizes, PosterSizes } from '../../core/enums';
import { IMAGE_BASE_URL } from '../../core/constants';
import { goToTop, assertNonNull } from '../../core/utils';
import { Search } from '../../pages/Movies/components/Search';

import { Content } from './components/Content';
import { Recommend } from './components/Recommend';

const MovieComponent = () => {
  const { id } = useParams();
  assertNonNull(id, 'Movie id is null');
  const movieId = parseInt(id, 10);
  const [isFullSizeImage, setIsFullSizeImage] = useState(false);
  const {
    data: movie,
    isLoading,
    isError,
    error,
  } = useQuery<MovieDetail, AxiosError>(['movie', movieId], () =>
    MovieService.getMovieDetail(movieId));
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

  const imageUrl =
    movie.posterPath != null ?
      `${IMAGE_BASE_URL}${PosterSizes.extraExtraLarge}${movie.posterPath}` :
      '/images/no-image.png';
      const fullSizeImageUrl = movie.posterPath !== null ?
        `${IMAGE_BASE_URL}${PosterSizes.original}${movie.posterPath}` :
        '/images/no-image.png';
    const backdropUrl =
        movie.backdropPath != null ?
          `${IMAGE_BASE_URL}${BackdropSizes.original}${movie.backdropPath}` :
          '/images/no-image.png';
  return (
    <div className="pt-10 relative">
      <div className="w-1/5 absolute top-0 right-0">
        <Search />
      </div>
      <div className="m-auto flex max-w-screen-xl pb-10 pt-4">
        <div className="max-w-[38%] p-10">
          <img
            src={imageUrl}
            alt={`${movie.title} image`}
            className="max-w-full rounded-xl shadow-2xl cursor-zoom-in"
            onClick={() => setIsFullSizeImage(true)}
          />
        </div>
        <div className="max-w-[60%] p-10">
          <Content movie={movie} />
        </div>
      </div>
      <Recommend movieId={movie.id} />
      {isFullSizeImage && fullSizeImageUrl !== null && (
        <Modal setIsOpen={setIsFullSizeImage}>
          <img src={fullSizeImageUrl} alt="full size image" className="h-[95vh]" />
        </Modal>
      )}
    </div>
  );
};

export const Movie = memo(MovieComponent);
