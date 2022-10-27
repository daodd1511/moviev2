import { memo, useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';

import { Type } from '../../core/enums';

import { Sidebar } from './components';
import { Search } from './components/Search';

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

  const goToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
  return (
    <div className="relative">
      <div className="w-1/5 absolute top-10 right-10 z-50">
        <Search />
      </div>
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
            <img src="/images/up.png" alt="Up icon"/>
          </button>
        )}
      </div>
    </div>
  );
};

export const Movies = memo(MoviesComponent);
