import { memo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';

import { TvDetail, Video } from '@/models';
import { Modal } from '@/shared/components/Modal';

interface Props {

  /** Tv detail. */
  readonly tv: TvDetail;

}

const ButtonsComponent = ({ tv }: Props) => {
  const [isWatchTrailer, setIsWatchTrailer] = useState(false);
  const getTrailerKey = (videos: readonly Video[]) => {
    const trailer = videos.find(video => video.type === 'Trailer');
    return trailer != null ? trailer.key : '';
  };
  const trailerKey = getTrailerKey(tv.videos);
  return (
    <>
      <button
        type="button"
        className="h-10 w-28 rounded-full border border-gray-800 text-xs transition-all hover:-translate-y-0.5 hover:bg-gray-800 hover:text-white"
        onClick={() => setIsWatchTrailer(true)}
      >
            Trailer <FontAwesomeIcon icon={faVideo} className="ml-1" />
      </button>
      {isWatchTrailer && trailerKey !== '' && (
        <Modal setIsOpen={setIsWatchTrailer}>
          <div className="z-50 w-5/6">
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}`}
              width="100%"
              height="100%"
              allowFullScreen={true}
              className="aspect-video"
            />
          </div>
        </Modal>
      )}
    </>
  );
};

export const Buttons = memo(ButtonsComponent);
