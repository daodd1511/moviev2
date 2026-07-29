import { useRef, useEffect } from 'react';

/**
 * Watch the last item in the list and return true when it is visible.
 * @param options Options for intersection observer.
 * @param callbackFunction Callback function to be executed when the last item is visible.
 * @param hasNextPage Boolean to indicate if there is a next page.
 */
export const useInfiniteScroll = (
  options: IntersectionObserverInit,
  callbackFunction: () => void,
  hasNextPage: boolean | undefined,
) => {
  const observerElement = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (hasNextPage === undefined) {
      return;
    }

    const element = observerElement.current;
    if (element === null) {
      return;
    }

    const observer = new IntersectionObserver(entries => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        callbackFunction();
      }
    }, options);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [callbackFunction, hasNextPage, options]);

  return { observerElement };
};
