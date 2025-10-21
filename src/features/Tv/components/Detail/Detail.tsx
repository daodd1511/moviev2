/* eslint-disable max-lines-per-function */
import { memo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Content } from './components';

import { Cast } from '@/shared/components/Cast';

import { assertNonNull } from '@/shared/utils';
import { Modal } from '@/shared/components/Modal';
import { Footer, Loader } from '@/shared/components';
import { PosterSizes } from '@/shared/enums';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { TvQueries } from '@/stores/queries/tvQueries';
import { MediaType } from '@/shared/enums/mediaType';
import { Recommend } from '@/shared/components/Recommend';

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

  if (isLoading) {
    return <Loader className="h-withoutNavbar"/>;
}

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  const imageURL =
    tv.posterPath !== null ?
      `${IMAGE_BASE_URL}${PosterSizes.extraExtraLarge}${tv.posterPath}` :
      '/images/no-image.png';
  const fullSizeImageUrl =
    tv.posterPath !== null ?
      `${IMAGE_BASE_URL}${PosterSizes.original}${tv.posterPath}` :
      '/images/no-image.png';
  return (
    <div className="p-5 md:p-10 relative">
      <div className="text-sm breadcrumbs">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/tv">Tv shows</Link></li>
          <li>{tv.name}</li>
        </ul>
      </div>
      <div className="flex flex-col md:flex-row md:justify-between pt-5 md:pt-10">
        <div className="max-w-[100%] md:max-w-[30%] p-5 md:p-10">
          <img
            src={imageURL}
            alt={`${tv.name} image`}
            className="max-w-full cursor-zoom-in rounded-xl shadow-2xl"
            onClick={() => setIsFullSizeImage(true)}
          />
        </div>
        <div className="max-w-[100%] md:max-w-[60%] p-5 md:p-10">
          <Content tv={tv}/>
        </div>
      </div>
      {((credits?.cast) != null) && credits.cast.length > 0 && (
        <div className="p-5 md:p-10">
          <Cast cast={credits.cast} title="Cast" />
        </div>
      )}
      <Recommend mediaId={tv.id} mediaType={MediaType.Tv}/>
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

export const Detail = memo(TvDetailComponent);
