import { AuthProvider } from '@/auth/MobileAuthProvider';
import { AuthNavigator } from '@/auth/auth-navigator';
import { useAppState } from '@/hooks/useAppState';
import { useOnlineManager } from '@/hooks/useOnlineManager';
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
import { LunaProvider, useTheme, useThemeMode } from '@guallet/luna-mobile';
import { LunaBottomSheetProvider } from '@/components/ui/BottomSheet';

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
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <GualletClientProvider client={gualletClient}>
              <AuthNavigator />
              <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
            </GualletClientProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

/** Install the Luna sheet adapter once for all mobile navigation screens. */
export function GualletApp() {
  useOnlineManager();
  useAppState(onAppStateChange);

  return (
    <LunaProvider>
      <LunaBottomSheetProvider>
        <AppNavigation />
      </LunaBottomSheetProvider>
    </LunaProvider>
  );
}
