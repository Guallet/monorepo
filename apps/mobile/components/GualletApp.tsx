import { AuthProvider } from '@/auth/MobileAuthProvider';
import { useAppState } from '@/hooks/useAppState';
import { useOnlineManager } from '@/hooks/useOnlineManager';
import {
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from 'expo-router/react-navigation';
import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { AppStateStatus, Platform } from 'react-native';
import { GualletClientProvider } from '@guallet/api-react';
import { gualletClient } from '@/api/gualletClient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LunaProvider, useTheme, useThemeMode } from '@guallet/ui-react-native';

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
      primary: colors.primary,
      background: colors.pageBackground,
      card: colors.tabBar.background,
      text: colors.text,
      border: colors.tabBar.border,
      notification: colors.error,
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
                  contentStyle: { backgroundColor: colors.pageBackground },
                  headerStyle: { backgroundColor: colors.background },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="modal"
                  options={{ presentation: 'modal', title: 'Modal' }}
                />
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
