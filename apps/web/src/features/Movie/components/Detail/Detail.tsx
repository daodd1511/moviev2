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
    return (
      <div className="min-h-[60vh]">
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
      <section className="relative flex min-h-[92vh] items-end overflow-hidden" aria-labelledby="movie-title">
        {backdropUrl != null ?
          (
            <div
              role="img"
              aria-label={`${movie.title} backdrop`}
              className="animate-hero-drift absolute inset-0 bg-cover"
              style={{ backgroundImage: `url(${backdropUrl})`, backgroundPosition: 'center 20%' }}
            />
          ) :
          <div className="absolute inset-0 bg-surface" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/35 to-transparent" />
        <div className="relative z-2 mx-auto flex w-full max-w-[82rem] flex-col items-start gap-8 px-4 pb-14 pt-32 md:flex-row md:items-end md:px-12">
          <button
            type="button"
            aria-label={`View full size poster for ${movie.title}`}
            className="w-40 shrink-0 cursor-zoom-in md:w-60"
            onClick={() => setIsFullSizeImage(true)}
          >
            <PosterPlate src={posterUrl} alt={`${movie.title} poster`} />
          </button>
          <Content movie={movie} credits={credits} />
        </div>
      </section>

      <main className="mx-auto max-w-[82rem] px-4 md:px-12">
        <Overview movie={movie} credits={credits} />
        {credits != null && (
          <Cast credits={credits} mediaType={MediaType.Movie} mediaId={movie.id} />
        )}
        <Recommend mediaId={movie.id} mediaType={MediaType.Movie} />
      </main>
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
