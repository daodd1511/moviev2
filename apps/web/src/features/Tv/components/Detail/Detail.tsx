import { memo, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Content, Overview, Seasons } from './components';

import { Cast } from '@/shared/components/Cast';

import { assertNonNull, goToTop } from '@/shared/utils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Footer, Loader } from '@/shared/components';
import { BackdropSizes, PosterSizes } from '@/shared/enums';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { TvQueries } from '@/stores/queries/tvQueries';
import { MediaType } from '@/shared/enums/mediaType';
import { Recommend } from '@/shared/components/Recommend';
import { PosterPlate } from '@/shared/components/ui/PosterPlate';

const TvDetailComponent = () => {
  const { id } = useParams();
  assertNonNull(id, 'TV id is null');
  const tvId = parseInt(id, 10);
  const [isFullSizeImage, setIsFullSizeImage] = useState(false);
  const {
    data: tv,
    isLoading,
    isError,
    error,
  } = TvQueries.useDetail(tvId);

  const {
    data: credits,
  } = TvQueries.useCredits(tvId);

  useEffect(() => {
    goToTop();
  }, [id]);

  if (isLoading) {
    return <Loader className="min-h-[60vh]"/>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  const posterUrl =
    tv.posterPath !== null ?
      `${IMAGE_BASE_URL}${PosterSizes.extraExtraLarge}${tv.posterPath}` :
      '/images/no-image.png';
  const fullSizeImageUrl =
    tv.posterPath !== null ?
      `${IMAGE_BASE_URL}${PosterSizes.original}${tv.posterPath}` :
      '/images/no-image.png';
  const backdropUrl =
    tv.backdropPath != null ?
      `${IMAGE_BASE_URL}${BackdropSizes.original}${tv.backdropPath}` :
      null;

  return (
    <div className="relative">
      <section className="relative flex min-h-[92vh] items-end overflow-hidden" aria-labelledby="tv-title">
        {backdropUrl != null ?
          (
            <div
              role="img"
              aria-label={`${tv.name} backdrop`}
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
            aria-label={`View full size poster for ${tv.name}`}
            className="w-40 shrink-0 cursor-zoom-in md:w-60"
            onClick={() => setIsFullSizeImage(true)}
          >
            <PosterPlate src={posterUrl} alt={`${tv.name} poster`} />
          </button>
          <Content tv={tv} />
        </div>
      </section>

      <main className="mx-auto max-w-[82rem] px-4 md:px-12">
        <Overview tv={tv} />
        <Seasons seasons={tv.seasons} />
        {credits != null && (
          <Cast credits={credits} mediaType={MediaType.Tv} mediaId={tv.id} />
        )}
        <Recommend mediaId={tv.id} mediaType={MediaType.Tv} />
      </main>
      <Footer />

      <Dialog open={isFullSizeImage} onOpenChange={setIsFullSizeImage}>
        <DialogContent className="w-fit max-w-[95vw] border-0 bg-transparent p-0 shadow-none ring-0">
          <DialogTitle className="sr-only">{tv.name} full size poster</DialogTitle>
          <img
            src={fullSizeImageUrl}
            alt={`${tv.name} full size poster`}
            className="h-[95vh]"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const Detail = memo(TvDetailComponent);
