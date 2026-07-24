import { memo, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Content, Overview } from './components';

import { Recommend } from '@/shared/components/Recommend';
import { Cast } from '@/shared/components/Cast';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Footer, Loader } from '@/shared/components';
import { BackdropSizes, PosterSizes } from '@/shared/enums';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { goToTop, assertNonNull } from '@/shared/utils';
import { NotFound } from '@/shared/components/NotFound';
import { MovieQueries } from '@/stores/queries/movieQueries';
import { MediaType } from '@/shared/enums/mediaType';
import { PosterPlate } from '@/shared/components/ui/PosterPlate';

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
    return <Loader className="min-h-[60vh]" />;
  }

  if (isError) {
    if (error.response?.status === 404) {
      return <NotFound />;
    }
    return <div>Error: {error.message}</div>;
  }

  const posterUrl =
    movie.posterPath != null ?
      `${IMAGE_BASE_URL}${PosterSizes.extraExtraLarge}${movie.posterPath}` :
      '/images/no-image.png';
  const fullSizeImageUrl =
    movie.posterPath !== null ?
      `${IMAGE_BASE_URL}${PosterSizes.original}${movie.posterPath}` :
      '/images/no-image.png';
  const backdropUrl =
    movie.backdropPath != null ?
      `${IMAGE_BASE_URL}${BackdropSizes.original}${movie.backdropPath}` :
      null;

  return (
    <div className="relative">
      <section
        className="relative left-1/2 flex w-screen -translate-x-1/2 items-end overflow-hidden bg-background md:min-h-[92svh]"
        aria-labelledby="movie-title"
      >
        {backdropUrl != null ?
          (
            <div
              role="img"
              aria-label={`${movie.title} backdrop`}
              className="animate-hero-drift absolute inset-0 hidden bg-cover md:block md:[background-position:center_20%]"
              style={{ backgroundImage: `url(${backdropUrl})` }}
            />
          ) :
          <div className="absolute inset-0 hidden bg-surface md:block" />}
        <div className="absolute inset-0 hidden bg-gradient-to-t from-background via-background/55 to-background/25 md:block" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-background/85 via-background/35 to-transparent md:block" />
        <div className="relative z-2 mx-auto flex w-full max-w-[90rem] flex-col items-center gap-7 px-4 pb-10 pt-20 md:flex-row md:items-end md:gap-10 md:px-12 md:pb-16 md:pt-32 lg:gap-14 lg:px-16 xl:px-20">
          <button
            type="button"
            aria-label={`View full size poster for ${movie.title}`}
            className="w-[min(68vw,18rem)] shrink-0 cursor-zoom-in transition-transform duration-300 hover:-translate-y-1 md:w-64 lg:w-72 xl:w-80"
            onClick={() => setIsFullSizeImage(true)}
          >
            <PosterPlate src={posterUrl} alt={`${movie.title} poster`} />
          </button>
          <Content movie={movie} credits={credits} />
        </div>
      </section>

      <main className="mx-auto max-w-[90rem] px-4 md:px-12 lg:px-16 xl:px-20">
        <Overview movie={movie} credits={credits} />
        {credits != null && (
          <Cast credits={credits} mediaType={MediaType.Movie} mediaId={movie.id} />
        )}
        <Recommend mediaId={movie.id} mediaType={MediaType.Movie} />
      </main>
      <Footer />

      <Dialog open={isFullSizeImage} onOpenChange={setIsFullSizeImage}>
        <DialogContent className="w-auto max-w-none border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-none">
          <DialogTitle className="sr-only">{movie.title} full size poster</DialogTitle>
          <img
            src={fullSizeImageUrl}
            alt={`${movie.title} full size poster`}
            className="block h-auto max-h-[90vh] w-auto max-w-[92vw] rounded-lg object-contain shadow-[0_28px_80px_-20px_rgba(0,0,0,0.9)]"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const Detail = memo(MovieDetailComponent);
