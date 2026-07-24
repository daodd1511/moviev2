import { memo, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';

import { TvByDiscover } from '../components';

import { goToTop } from '@/shared/utils';

const SCROLL_THRESHOLD = 800;

const TVsComponent = () => {
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
      <TvByDiscover />
      {showTopBtn && (
        <button
          type="button"
          className="fixed bottom-5 right-10 z-10 h-10 w-10 rounded-full flex justify-center items-center"
          onClick={goToTop}
        >
          <ChevronUp className="h-7 w-7" />
        </button>
      )}
    </div>
  );
};

export const TVsPage = memo(TVsComponent);
