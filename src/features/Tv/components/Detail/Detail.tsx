/* eslint-disable max-lines-per-function */
import { memo, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import { Content, Recommend, Select } from './components';

import { assertNonNull, goToTop } from '@/shared/utils';
import { Modal } from '@/shared/components/Modal';
import { Footer, Loader } from '@/shared/components';
import { API_CONFIG } from '@/api/config';
import { PosterSizes } from '@/shared/enums';
import { IMAGE_BASE_URL, LOCAL_STORAGE_KEY } from '@/shared/constants';
import { TvQueries } from '@/stores/queries/tvQueries';

const TvDetailComponent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  assertNonNull(id, 'TV id is null');
  const tvId = parseInt(id, 10);
  const [isWatchTv, setIsWatchTv] = useState(false);
  const [isFullSizeImage, setIsFullSizeImage] = useState(false);
  const [season, setSeason] = useState<number>(-1);
  const [episode, setEpisode] = useState<number>(-1);
  const {
    data: tv,
    isLoading,
    isError,
    error,
  } = TvQueries.useDetail(tvId);

  const videoSource =
    id !== undefined && season !== undefined && episode !== undefined ?
      `${API_CONFIG.videoApiUrl}tv?id=${id}&s=${season}&e=${episode}` :
      null;

  useEffect(() => {
    const storageKey = `${LOCAL_STORAGE_KEY.watchTV}_${id}`;
    if (isWatchTv) {
      localStorage.setItem(storageKey, JSON.stringify({ id, season, episode }));
    }
  }, [isWatchTv]);
  useEffect(() => {
    setSeason(-1);
    setEpisode(-1);
    const storageKey = `${LOCAL_STORAGE_KEY.watchTV}_${id}`;
    const data = localStorage.getItem(storageKey);
    if (data !== null) {
      const {
        id: storageId,
        season: storageSeason,
        episode: storageEpisode,
      } = JSON.parse(data);
      if (id === storageId) {
        setSeason(storageSeason);
        setEpisode(storageEpisode);
      }
    }
    goToTop();
  }, [id]);

  const onBackButtonClick = () => {
    navigate(-1);
  };

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
    <div className="p-10 relative">
      <button
        type="button"
        className="absolute top-8 left-10"
        onClick={onBackButtonClick}
      >
        <FontAwesomeIcon icon={faArrowLeft} className="text-xl"/>
      </button>
      <div className="m-auto flex max-w-screen-xl">
        <div className="max-w-[40%] p-10">
          <img
            src={imageURL}
            alt={`${tv.name} image`}
            className="max-w-full cursor-zoom-in rounded-xl shadow-2xl"
            onClick={() => setIsFullSizeImage(true)}
          />
          <div>
            <Select
              season={season}
              episode={episode}
              setEpisode={setEpisode}
              setSeason={setSeason}
              tv={tv}
              tvId={tvId}
            />
          </div>
        </div>
        <div className="max-w-[60%] p-10">
          <Content tv={tv}/>
        </div>
      </div>
      <Recommend tvId={tv.id} />
      <Footer />

      {isWatchTv && videoSource !== null && (

        <Modal setIsOpen={setIsWatchTv}>
          <div className="z-10 w-5/6">
            <iframe
              src={videoSource}
              width="100%"
              height="100%"
              allowFullScreen={true}
              className="aspect-video"
            />
          </div>
        </Modal>
      )}
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
