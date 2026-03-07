import { useSyncExternalStore } from 'react';

const MOBILE_MEDIA_QUERY = '(max-width: 50em)';

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

function getSnapshot() {
  if (globalThis.window === undefined) {
    return false;
  }

  return globalThis.window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useIsMobile() {
  return useSyncExternalStore(
    subscribeToMediaQuery,
    getSnapshot,
    getServerSnapshot,
  );
}
