import { useRef, useEffect } from 'react';

/**
 * Watch the last item in the list and return true when it is visible.
 * @param options Options for intersection observer.
 * @param callbackFunction Callback function to be executed when the last item is visible.
 * @param hasNextPage Boolean to indicate if there is a next page.
 */
export const useInfiniteScroll = (options: Object, callbackFunction: Function, hasNextPage: boolean | undefined) => {
  const observerElement = useRef(null);

  const executeFunction = (entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      callbackFunction();
    }
  };
    const observer = new IntersectionObserver(
      executeFunction,
      options,
    );
  useEffect(() => {
    if (hasNextPage === undefined) {
      return;
    }

    if (observerElement.current !== null) {
      observer.observe(observerElement.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [observerElement, hasNextPage]);

  return { observerElement };
};
