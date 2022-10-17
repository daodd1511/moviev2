import { memo, useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';

import { Type } from '../../core/enums';

import { Sidebar } from './components';

const SCROLL_THRESHOLD = 800;

const MoviesComponent = () => {
  const { type } = useParams();
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

  const goToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
  return (
    <div className="flex">
      <div className="sticky top-0 h-screen overflow-y-auto overflow-x-hidden">
        <Sidebar type={type as Type ?? Type.Movie} />
      </div>
      <div className="w-[1px] bg-slate-300 py-2" />
      <div className="grow">
        <Outlet />
      </div>
      {showTopBtn && (
        <button
          type="button"
          className="fixed bottom-5 right-5 z-10 h-10 w-10 rounded-full bg-sky-400"
          onClick={goToTop}
        >
          Top
        </button>
      )}
    </div>
  );
};

export const Movies = memo(MoviesComponent);
