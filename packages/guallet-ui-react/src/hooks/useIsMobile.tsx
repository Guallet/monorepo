import { useSyncExternalStore } from 'react';

/**
 * Mobile breakpoint used for responsive detection
 * Value of 50em is equivalent to 800px
 */
export const MOBILE_BREAKPOINT = '50em';

const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT})`;

function getMediaQueryMatch(query: string): boolean {
  if (globalThis.window === undefined) {
    return false;
  }

  return globalThis.window.matchMedia(query).matches;
}

function subscribeToMediaQuery(onStoreChange: () => void): () => void {
  if (globalThis.window === undefined) {
    return () => {};
  }

  const mediaQuery = globalThis.window.matchMedia(MOBILE_MEDIA_QUERY);
  const onMediaQueryChange = () => {
    onStoreChange();
  };

  mediaQuery.addEventListener('change', onMediaQueryChange);

  return () => {
    mediaQuery.removeEventListener('change', onMediaQueryChange);
  };
}

function getMediaQuerySnapshot(): boolean {
  return getMediaQueryMatch(MOBILE_MEDIA_QUERY);
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Hook to detect if the current viewport is mobile-sized
 * Uses window.matchMedia with a breakpoint of 50em (800px)
 *
 * @returns {boolean} true if viewport width is <= 50em, false otherwise
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribeToMediaQuery,
    getMediaQuerySnapshot,
    getServerSnapshot,
  );
}
