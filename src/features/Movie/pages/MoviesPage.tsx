import { memo, useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp } from '@fortawesome/free-solid-svg-icons';

import { Sidebar } from '../components';

import { goToTop } from '@/shared/utils';
import { Type } from '@/shared/enums';

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
      <div className="flex">
        <div className="sticky top-0 h-screen overflow-y-auto overflow-x-hidden">
          <Sidebar type={Type.Movie} />
        </div>
        <div className="w-[1px] bg-slate-300 py-2" />
        <div className="grow">
          <Outlet />
        </div>
        {showTopBtn && (
          <button
            type="button"
            className="fixed bottom-5 right-5 z-10 h-10 w-10 rounded-full flex justify-center items-center"
            onClick={goToTop}
          >
            <FontAwesomeIcon icon={faAngleUp} className="text-3xl" />

          </button>
        )}
      </div>
    </div>
  );
};

export const Movies = memo(MoviesComponent);
