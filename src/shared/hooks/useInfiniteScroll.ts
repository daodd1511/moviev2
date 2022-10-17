import { useRef, useEffect } from 'react';

/**
 * Watch the last item in the list and return true when it is visible.
 * @param options Options for intersection observer.
 * @param callbackFunction Callback function to be executed when the last item is visible.
 * @param hasNextPage Boolean to indicate if there is a next page.
 * @param isFetchingNextPage Boolean to indicate if the next page is being fetched.
 */
export const useInfiniteScroll = (options: Object, callbackFunction: Function, hasNextPage: boolean | undefined, isFetchingNextPage: boolean) => {
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
    if (hasNextPage === undefined || isFetchingNextPage) {
      return;
    }

    if (observerElement.current !== null) {
      observer.observe(observerElement.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [observerElement, isFetchingNextPage, hasNextPage]);

  return { observerElement };
};
