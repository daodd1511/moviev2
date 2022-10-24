/* eslint-disable max-lines-per-function */
import { memo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
import { Select } from './components/Select';

const TVComponent = () => {
  const { id } = useParams();
  const tvId = id !== undefined ? parseInt(id, 10) : undefined;
  const [isWatchTv, setIsWatchTv] = useState(false);
  const [isFullSizeImage, setIsFullSizeImage] = useState(false);
  const [seasonNumber, setSeasonNumber] = useState<number>(-1);
  const [episodeNumber, setEpisodeNumber] = useState<number>(-1);
  const {
    data: tv,
    isLoading,
    isError,
    error,
  } = useQuery<TvDetail, AxiosError>(['tv', tvId], () =>
    TvService.getTvDetail(tvId));

  const videoSource =
    id !== undefined &&
    seasonNumber !== undefined &&
    episodeNumber !== undefined ?
      `${API_CONFIG.videoApiUrl}tv?id=${id}&s=${seasonNumber}&e=${episodeNumber}` :
      null;

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
    tv.posterPath !== null ?
      `${IMAGE_BASE_URL}${PosterSizes.extraExtraLarge}${tv.posterPath}` :
      '/images/no-image.png';
  const fullSizeImageUrl = tv.posterPath !== null ?
    `${IMAGE_BASE_URL}${PosterSizes.original}${tv.posterPath}` :
    '/images/no-image.png';
  return (
    <div className="p-10">
      <Link to="/tv" className="text-3xl">
        Home
      </Link>
      <div>Tv detail page</div>
      <div className="m-auto flex max-w-screen-xl">
        <div className="max-w-[40%] p-10">
          <img
            src={imageURL}
            alt={`${tv.name} image`}
            className="max-w-full rounded-xl shadow-2xl cursor-zoom-in"
            onClick={() => setIsFullSizeImage(true)}
          />
          <div>
            <Select
              seasonNumber={seasonNumber}
              episodeNumber={episodeNumber}
              setEpisodeNumber={setEpisodeNumber}
              setSeasonNumber={setSeasonNumber}
              tv={tv}
              tvId={tvId}
            />
            <button
              type="button"
              disabled={seasonNumber === -1 || episodeNumber === -1}
              className="mr-2 mb-2 w-full rounded-lg border border-blue-700 px-5 py-2.5 text-center text-sm font-medium text-blue-700 hover:bg-blue-800 hover:text-white disabled:cursor-not-allowed    disabled:hover:bg-transparent disabled:hover:text-blue-700"
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
      {isFullSizeImage && fullSizeImageUrl !== null && (
        <Modal setIsOpen={setIsFullSizeImage}>
          <img src={fullSizeImageUrl} alt="full size image" className="h-[95vh]" />
        </Modal>
      )}
    </div>
  );
};

export const TV = memo(TVComponent);
