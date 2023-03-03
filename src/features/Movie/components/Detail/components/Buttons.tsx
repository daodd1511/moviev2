import { memo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { faImdb } from '@fortawesome/free-brands-svg-icons';

import { MovieDetail, Video } from '@/models';
import { Modal } from '@/shared/components/Modal';

interface Props {

  /** Movie detail. */
  readonly movie: MovieDetail;
}

const ButtonsComponent = ({ movie }: Props) => {
  const [isWatchTrailer, setIsWatchTrailer] = useState(false);
  const getTrailerKey = (videos: readonly Video[]) => {
    const trailer = videos.find(video => video.type === 'Trailer');
    return trailer != null ? trailer.key : '';
  };
  const trailerKey = getTrailerKey(movie.videos);
  return (
    <>
      <div className="flex justify-between">
        <div>
          {movie.imdbId !== null && (
            <a
              href={`https://www.imdb.com/title/${movie.imdbId}/`}
              className="mr-8"
              target="_blank"
              rel="noreferrer"
            >
              <button
                type="button"
                className="h-10 w-28 rounded-full border border-gray-800 text-xs transition-all hover:-translate-y-0.5 hover:bg-gray-800 hover:text-white"
              >
                IMDB <FontAwesomeIcon icon={faImdb} className="ml-1"/>
              </button>
            </a>
          )}
          <button
            type="button"
            className="h-10 w-28 rounded-full border border-gray-800 text-xs transition-all hover:-translate-y-0.5 hover:bg-gray-800 hover:text-white"
            onClick={() => setIsWatchTrailer(true)}
          >
            Trailer <FontAwesomeIcon icon={faVideo} className="ml-1"/>
          </button>
        </div>
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
