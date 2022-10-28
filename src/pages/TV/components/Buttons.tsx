import { memo, useState } from 'react';

import { TvDetail, Video } from '../../../core/models';
import { Modal } from '../../../shared/components/Modal';

interface Props {

  /** Tv detail. */
  readonly tv: TvDetail;

  /** Set is watch tv. */
  readonly setIsWatchTv: (isWatchTv: boolean) => void;

  /** Watch button disable state. */
  readonly isWatchButtonDisabled: boolean;
}

const ButtonsComponent = ({ tv, setIsWatchTv, isWatchButtonDisabled }: Props) => {
  const [isWatchTrailer, setIsWatchTrailer] = useState(false);
  const getTrailerKey = (videos: readonly Video[]) => {
    const trailer = videos.find(video => video.type === 'Trailer');
    return trailer != null ? trailer.key : '';
  };
  const trailerKey = getTrailerKey(tv.videos);
  return (
    <>
      <div className="flex justify-between">
        <div>
          <button
            type="button"
            className="h-10 w-28 rounded-full border border-gray-800 text-xs transition-all hover:-translate-y-0.5 hover:bg-gray-800 hover:text-white"
            onClick={() => setIsWatchTrailer(true)}
          >
            Trailer
          </button>
        </div>
        <button
          type="button"
          disabled={isWatchButtonDisabled}
          className="h-10 w-28 rounded-full border border-gray-800 bg-gray-800 text-xs text-white transition-all hover:-translate-y-0.5 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:hover:bg-transparent"
          onClick={() => setIsWatchTv(true)}
        >
          Watch
        </button>
      </div>
      {isWatchTrailer && trailerKey !== '' && (
        <Modal setIsOpen={setIsWatchTrailer}>
          <div className="z-50 w-5/6">
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}`}
              width="100%"
              height="100%"
              frameBorder="0"
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
