import { useEffect } from 'react';

let listenerCallbacks = new WeakMap();

let observer: IntersectionObserver | undefined;

const handleIntersections = (entries: IntersectionObserverEntry[]) => {
  entries.forEach(entry => {
    if (listenerCallbacks.has(entry.target)) {
      let cb = listenerCallbacks.get(entry.target);

      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        observer?.unobserve(entry.target);
        listenerCallbacks.delete(entry.target);
        cb();
      }
    }
  });
}

const getIntersectionObserver = () => {
  if (observer === undefined) {
    observer = new IntersectionObserver(handleIntersections, {
      rootMargin: '100px',
      threshold: 0.15,
    });
  }
  return observer;
}

const useIntersectionObserver = (ref: React.MutableRefObject<any>, callback: () => void | Promise<void>) => {
  useEffect(() => {
    let target = ref.current;
    let observer = getIntersectionObserver();
    listenerCallbacks.set(target, callback);
    observer.observe(target);

    return () => {
      listenerCallbacks.delete(target);
      observer.unobserve(target);
    };
  }, [ref, callback]);
}

export default useIntersectionObserver;
