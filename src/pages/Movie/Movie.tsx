import { memo, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import { Modal } from '../../shared/components/Modal';
import { MovieDetail } from '../../models';
import { MovieService } from '../../api/services/movieService';
import { Footer, Spinner } from '../../shared/components';
import { PosterSizes } from '../../shared/enums';
import { IMAGE_BASE_URL } from '../../shared/constants';
import { goToTop, assertNonNull } from '../../shared/utils';
import { Search } from '../../pages/Movies/components/Search';

import noImage from '../../assets/no-image.png';

import { Content } from './components/Content';
import { Recommend } from './components/Recommend';

const MovieComponent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const onBackButtonClick = () => {
    navigate(-1);
  };
  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  const imageUrl =
    movie.posterPath != null ?
      `${IMAGE_BASE_URL}${PosterSizes.extraExtraLarge}${movie.posterPath}` :
      { noImage };
  const fullSizeImageUrl =
    movie.posterPath !== null ?
      `${IMAGE_BASE_URL}${PosterSizes.original}${movie.posterPath}` :
      { noImage };

  return (
    <div className="relative p-10">
      <button
        type="button"
        className="absolute top-2 left-10"
        onClick={onBackButtonClick}
      >
        <FontAwesomeIcon icon={faArrowLeft} className="text-xl"/>
      </button>
      <div className="absolute top-0 right-10 w-1/5">
        <Search />
      </div>
      <div className="m-auto flex max-w-screen-xl pb-10 pt-4">
        <div className="max-w-[38%] p-10">
          <img
            src={imageUrl}
            alt={`${movie.title} image`}
            className="max-w-full cursor-zoom-in rounded-xl shadow-2xl"
            onClick={() => setIsFullSizeImage(true)}
          />
        </div>
        <div className="max-w-[60%] p-10">
          <Content movie={movie} />
        </div>
      </div>
      <Recommend movieId={movie.id} />
      <Footer />
      {isFullSizeImage && fullSizeImageUrl !== null && (
        <Modal setIsOpen={setIsFullSizeImage}>
          <img
            src={fullSizeImageUrl}
            alt="full size image"
            className="h-[95vh]"
          />
        </Modal>
      )}
    </div>
  );
};

export const Movie = memo(MovieComponent);
