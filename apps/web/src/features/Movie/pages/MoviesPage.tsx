import { memo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';

import { MovieByDiscover } from '../components';

import { goToTop } from '@/shared/utils';
import { useScrollThreshold } from '@/shared/hooks';

const SCROLL_THRESHOLD = 800;

const MoviesComponent = () => {
  const params = useParams();
  const showTopBtn = useScrollThreshold(SCROLL_THRESHOLD);

  useEffect(() => {
    goToTop();
  }, [params]);
  return (
    <div className="relative">
      <MovieByDiscover />
      {showTopBtn && (
        <button
          type="button"
          aria-label="Scroll to top"
          className="fixed right-4 bottom-24 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-background md:right-5 md:bottom-5 md:h-12 md:w-12"
          onClick={goToTop}
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export const Movies = memo(MoviesComponent);
