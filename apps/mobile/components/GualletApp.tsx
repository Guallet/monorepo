import { AuthProvider } from '@/auth/MobileAuthProvider';
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
import { Stack } from 'expo-router';
import { AppStateStatus, Platform } from 'react-native';
import { gualletClient } from '@/api/gualletClient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LunaProvider, useTheme, useThemeMode } from '@guallet/luna-mobile';

// Create a client
const queryClient = new QueryClient();

function onAppStateChange(status: AppStateStatus) {
  // React Query already supports in web browser refetch on window focus by default
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

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
              <Stack
                screenOptions={{
                  contentStyle: {
                    backgroundColor: colors.surface.background.page,
                  },
                  headerStyle: {
                    backgroundColor: colors.surface.background.primary,
                  },
                  headerBackButtonDisplayMode: 'minimal',
                  headerTintColor: colors.text.primary,
                  headerTitleStyle: { color: colors.text.primary },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
              <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
            </GualletClientProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

export function GualletApp() {
  useOnlineManager();
  useAppState(onAppStateChange);

  return (
    <LunaProvider>
      <AppNavigation />
    </LunaProvider>
  );
}
