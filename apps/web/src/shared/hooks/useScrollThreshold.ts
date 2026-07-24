import { useEffect, useRef, useState } from 'react';

/** Whether the window has scrolled past `threshold` pixels, updated via rAF-throttled scroll listener. */
export const useScrollThreshold = (threshold: number): boolean => {
  const [isPastThreshold, setIsPastThreshold] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) {
        return;
      }
      ticking.current = true;
      requestAnimationFrame(() => {
        setIsPastThreshold(window.scrollY > threshold);
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return isPastThreshold;
};
