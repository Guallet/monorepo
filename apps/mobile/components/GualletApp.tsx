import { AuthProvider } from '@/auth/MobileAuthProvider';
import { AuthNavigator } from '@/auth/auth-navigator';
import { useAppState } from '@/hooks/useAppState';
import { useOnlineManager } from '@/hooks/useOnlineManager';
import { AppThemeProvider } from '@/theme/AppThemeProvider';
import {
  focusManager,
  GualletClientProvider,
  QueryClient,
  QueryClientProvider,
} from '@guallet/api-react';
import {
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from 'expo-router/react-navigation';
import { AppStateStatus, Platform } from 'react-native';
import { gualletClient } from '@/api/gualletClient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  AlertProvider,
  useTheme,
  useThemeMode,
  ToastProvider,
} from '@guallet/luna-mobile';

// Create a client
const queryClient = new QueryClient();

/** Mirror native foreground state into TanStack Query's focus manager. */
function onAppStateChange(status: AppStateStatus) {
  // React Query already supports in web browser refetch on window focus by default
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

/** Compose navigation and data providers within Luna's theme. */
function AppNavigation() {
  const { colors } = useTheme();
  const mode = useThemeMode();

  const navigationTheme = {
    ...NavigationDefaultTheme,
    dark: mode === 'dark',
    colors: {
      ...NavigationDefaultTheme.colors,
      primary: colors.accent.primary,
      background: colors.surface.background.page,
      card: colors.tabBar.background,
      text: colors.text.primary,
      border: colors.tabBar.border,
      notification: colors.status.error,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ToastProvider>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <GualletClientProvider client={gualletClient}>
                  <AlertProvider>
                    <AuthNavigator />
                    <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
                  </AlertProvider>
                </GualletClientProvider>
              </AuthProvider>
            </QueryClientProvider>
          </ToastProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

/** Connect mobile navigation to the Luna theme. */
export function GualletApp() {
  useOnlineManager();
  useAppState(onAppStateChange);

  return (
    <AppThemeProvider>
      <AppNavigation />
    </AppThemeProvider>
  );
}
