import { memo, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import { Content } from './components/Content';
import { Recommend } from './components/Recommend';

import { Modal } from '@/shared/components/Modal';
import { Footer, Loader } from '@/shared/components';
import { PosterSizes } from '@/shared/enums';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { goToTop, assertNonNull } from '@/shared/utils';
import { NotFound } from '@/shared/components/NotFound';
import { MovieQueries } from '@/stores/queries/movieQueries';

const MovieDetailComponent = () => {
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
  } = MovieQueries.useDetail(movieId);
  useEffect(() => {
    goToTop();
  }, [id]);

  const onBackButtonClick = () => {
    navigate(-1);
  };
  if (isLoading) {
    return (
      <div className="h-withoutNavbar">
        <Loader />
      </div>
    );
  }

  if (isError) {
    if (error.response?.status === 404) {
      return <NotFound />;
    }
    return <div>Error: {error.message}</div>;
  }

  const imageUrl =
    movie.posterPath != null ?
      `${IMAGE_BASE_URL}${PosterSizes.extraExtraLarge}${movie.posterPath}` :
      '/images/no-image.png';
  const fullSizeImageUrl =
    movie.posterPath !== null ?
      `${IMAGE_BASE_URL}${PosterSizes.original}${movie.posterPath}` :
      '/images/no-image.png';

  return (
    <div className="relative p-10">
      <button
        type="button"
        className="absolute top-8 left-10"
        name="back"
        onClick={onBackButtonClick}
      >
        <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
      </button>
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
      {isFullSizeImage && (
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

export const Detail = memo(MovieDetailComponent);
