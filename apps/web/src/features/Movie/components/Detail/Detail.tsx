import { memo, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Content } from './components/Content';

import { Recommend } from '@/shared/components/Recommend';
import { Cast } from '@/shared/components/Cast';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Footer, Loader } from '@/shared/components';
import { PosterSizes } from '@/shared/enums';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { goToTop, assertNonNull } from '@/shared/utils';
import { NotFound } from '@/shared/components/NotFound';
import { MovieQueries } from '@/stores/queries/movieQueries';
import { MediaType } from '@/shared/enums/mediaType';

const MovieDetailComponent = () => {
  const { id } = useParams();
  assertNonNull(id, 'Movie id is null');
  const movieId = parseInt(id, 10);
  const [isFullSizeImage, setIsFullSizeImage] = useState(false);
  const {
    data: movie,
    isLoading,
    isError,
    error,
  } = MovieQueries.useDetail(movieId);

  const {
    data: credits,
  } = MovieQueries.useCredits(movieId);
  useEffect(() => {
    goToTop();
  }, [id]);

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

  // const directors = credits?.crew.filter((crew: { job: string; }) => crew.job === 'Director');

  const imageUrl =
    movie.posterPath != null ?
      `${IMAGE_BASE_URL}${PosterSizes.extraExtraLarge}${movie.posterPath}` :
      '/images/no-image.png';
  const fullSizeImageUrl =
    movie.posterPath !== null ?
      `${IMAGE_BASE_URL}${PosterSizes.original}${movie.posterPath}` :
      '/images/no-image.png';
  return (
    <div className="relative p-5 md:p-10">
      <div className="text-sm">
        <ul className="flex flex-wrap items-center gap-2 [&>li:not(:first-child)]:before:mr-2 [&>li:not(:first-child)]:before:text-gray-400 [&>li:not(:first-child)]:before:content-['/']">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/movie">Movies</Link></li>
          <li>{movie.title}</li>
        </ul>
      </div>
      <div className="flex flex-col md:flex-row md:justify-between pt-5 md:pt-10">
        <div className="max-w-[100%] md:max-w-[30%] p-5 md:p-10">
          <img
            src={imageUrl}
            alt={`${movie.title} image`}
            className="max-w-full cursor-zoom-in rounded-xl shadow-2xl"
            onClick={() => setIsFullSizeImage(true)}
          />
        </div>
        <div className="max-w-[100%] md:max-w-[60%] p-5 md:p-10">
          <Content movie={movie} credits={credits} />
        </div>
      </div>
      {credits != null && (
        <div className="p-5 md:p-10">
          <Cast credits={credits} />
        </div>
      )}
      <Recommend mediaId={movie.id} mediaType={MediaType.Movie} />
      <Footer />
      <Dialog open={isFullSizeImage} onOpenChange={setIsFullSizeImage}>
        <DialogContent className="w-fit max-w-[95vw] border-0 bg-transparent p-0 shadow-none ring-0">
          <DialogTitle className="sr-only">{movie.title} full size poster</DialogTitle>
          <img
            src={fullSizeImageUrl}
            alt={`${movie.title} full size poster`}
            className="h-2/3 md:h-[90vh]"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const Detail = memo(MovieDetailComponent);
