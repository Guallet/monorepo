import { useAuth } from '@guallet/auth';
import * as Linking from 'expo-linking';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createAuthDestinationStore } from './auth-destination';

/** Capture incoming links independently of the layouts Expo redirects away. */
export function useAuthDestination() {
  const { isAuthenticated } = useAuth();
  const authenticated = useRef(isAuthenticated);
  const [store] = useState(createAuthDestinationStore);
  const [isInitialLinkReady, setInitialLinkReady] = useState(false);
  const pendingDestination = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => null,
  );

  useEffect(() => {
    authenticated.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    let active = true;
    let receivedLiveProtectedLink = false;
    const appRootUrl = Linking.createURL('/');
    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (!authenticated.current && store.capture(url, appRootUrl)) {
        receivedLiveProtectedLink = true;
      }
    });

    async function captureInitialLink() {
      try {
        const url = await Linking.getInitialURL();
        if (active && url && !receivedLiveProtectedLink) {
          // Initial session resolution may still be pending. The navigator
          // resumes this intent only once authentication is confirmed.
          store.capture(url, appRootUrl);
        }
      } finally {
        if (active) setInitialLinkReady(true);
      }
    }

    // Failure to read an initial URL must not leave the splash stuck open.
    void captureInitialLink().catch(() => undefined);
    return () => {
      active = false;
      subscription.remove();
    };
  }, [store]);

  return { isInitialLinkReady, pendingDestination, clearPending: store.clear };
}
