import { memo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { TvDetail } from 'core/models';

import { TvService } from '../../api/services/tvService';
import { Modal } from '../../shared/components/Modal';
import { Spinner } from '../../shared/components';
import { API_CONFIG } from '../../api/config';
import { PosterSizes } from '../../core/enums';
import { IMAGE_BASE_URL } from '../../core/constants';

import { Content } from './components/Content';
import { Recommend } from './components/Recommend';

const TVComponent = () => {
  const { id } = useParams();
  const tvId = id !== undefined ? parseInt(id, 10) : undefined;
  const [isWatchTv, setIsWatchTv] = useState(false);
  const {
    data: tv,
    isLoading,
    isError,
    error,
  } = useQuery<TvDetail, AxiosError>(['tv', tvId], () =>
    TvService.getTvDetail(tvId));
  const videoSource =
    id !== undefined ? `${API_CONFIG.videoApiUrl}tv?id=${id}` : null;

  if (isLoading) {
    return (
      <div className="h-screen w-screen">
        {' '}
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  const imageURL =
    tv.posterPath != null ?
      `${IMAGE_BASE_URL}${PosterSizes.extraExtraLarge}${tv.posterPath}` :
      '/images/no-image.png';
  return (
    <div className="p-10">
      <div>Tv detail page</div>
      <div className="m-auto flex max-w-screen-xl">
        <div className="max-w-[40%] p-10">
          <img
            src={imageURL}
            alt={`${tv.name} image`}
            className="max-w-full rounded-xl shadow-2xl"
          />
          <div>
            <button
              type="button"
              className="mr-2 mb-2 w-full rounded-lg border border-blue-700 px-5 py-2.5 text-center text-sm font-medium text-blue-700 hover:bg-blue-800 hover:text-white"
              onClick={() => setIsWatchTv(true)}
            >
              Watch Tv
            </button>
          </div>
        </div>
        <div className="max-w-[60%] p-10">
          <Content tv={tv} />
        </div>
      </div>
      <Recommend tvId={tv.id} />
      <pre>{JSON.stringify(tv, null, 2)}</pre>
      {isWatchTv && videoSource !== null && (
        <Modal setIsOpen={setIsWatchTv}>
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
    </div>
  );
};

export const TV = memo(TVComponent);
