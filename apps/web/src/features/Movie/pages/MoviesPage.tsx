import { memo, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp } from '@fortawesome/free-solid-svg-icons';

import { MovieByDiscover } from '../components';

import { goToTop } from '@/shared/utils';

const SCROLL_THRESHOLD = 800;

const MoviesComponent = () => {
  const params = useParams();
  const [showTopBtn, setShowTopBtn] = useState(false);
  useEffect(() => {
    window.addEventListener('scroll', () => {
      if (window.scrollY > SCROLL_THRESHOLD) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    });
  }, []);

  useEffect(() => {
    goToTop();
  }, [params]);
  return (
    <div className="relative">
      {/* <Filter type={MediaType.Movie}/> */}
      <MovieByDiscover />
      {showTopBtn && (
        <button
          type="button"
          className="fixed bottom-5 right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full"
          onClick={goToTop}
        >
          <FontAwesomeIcon icon={faAngleUp} className="text-3xl" />
        </button>
      )}
    </div>
  );
};

export const Movies = memo(MoviesComponent);
