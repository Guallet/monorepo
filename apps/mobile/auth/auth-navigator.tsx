import { useNavigationScreenOptions } from '@/hooks/navigation-screen-options';
import { useAuth } from '@guallet/auth';
import { useTheme } from '@guallet/luna-mobile';
import {
  type Href,
  useNavigationContainerRef,
  usePathname,
  useRouter,
  useSegments,
} from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createAuthNavigationCoordinator } from './auth-destination';
import { useAuthDestination } from './use-auth-destination';

void SplashScreen.preventAutoHideAsync();

/** One session boundary protects every screen in the (protected) group. */
export function AuthNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isInitialLinkReady, pendingDestination, clearPending } =
    useAuthDestination();
  const { colors } = useTheme();
  const screenOptions = useNavigationScreenOptions();
  const navigation = useNavigationContainerRef();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const routeKey = `${segments.join('/')}:${pathname}`;
  const [coordinator] = useState(createAuthNavigationCoordinator);
  const [isNavigationReady, setNavigationReady] = useState(false);
  const isReady = !isLoading && isInitialLinkReady;
  const isLoginRoute = segments[0] === 'login';
  const isWelcomeRoute = segments[0] === 'welcome';
  const isCallbackRoute = isLoginRoute && segments[1] === 'callback';
  const isSignInRoute =
    isLoginRoute &&
    !['forgot-password', 'reset-password', 'reset-password-sent'].includes(
      segments[1] ?? '',
    );

  useEffect(() => {
    const updateReady = () => setNavigationReady(navigation.isReady());
    const removeReadyListener = navigation.addListener('ready', updateReady);
    const removeStateListener = navigation.addListener('state', updateReady);
    updateReady();
    return () => {
      removeReadyListener();
      removeStateListener();
    };
  }, [navigation]);

  useEffect(() => {
    if (!isReady || !isNavigationReady) return;
    const action = coordinator.getAction({
      isAuthenticated,
      routeKey,
      pendingDestination,
      isLoginRoute,
      isSignInRoute,
      isCallbackRoute,
      isWelcomeRoute,
    });
    if (action) {
      // Dynamic destinations enter this coordinator only after route validation.
      router.replace(action.destination as Href);
      if (action.clearPending) clearPending();
    }
    void SplashScreen.hideAsync();
  }, [
    isReady,
    isNavigationReady,
    isAuthenticated,
    pendingDestination,
    isLoginRoute,
    isSignInRoute,
    isCallbackRoute,
    isWelcomeRoute,
    router,
    clearPending,
    coordinator,
    routeKey,
  ]);

  if (!isReady) {
    return (
      <View
        style={[
          styles.loading,
          { backgroundColor: colors.surface.background.page },
        ]}
      >
        <ActivityIndicator
          accessibilityLabel="Loading your session"
          color={colors.accent.primary}
        />
      </View>
    );
  }

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
