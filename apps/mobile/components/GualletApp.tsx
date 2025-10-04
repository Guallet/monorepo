import { AuthProvider } from "@/auth/useAuth";
import { useAppState } from "@/hooks/useAppState";
import { useOnlineManager } from "@/hooks/useOnlineManager";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Stack } from "expo-router";
import { AppStateStatus, Platform, useColorScheme } from "react-native";
import { GualletClientProvider } from "@guallet/api-react";
import { gualletClient } from "@/api/gualletClient";
import { StatusBar } from "expo-status-bar";

// Create a client

function onAppStateChange(status: AppStateStatus) {
  // React Query already supports in web browser refetch on window focus by default
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

export function GualletApp() {
  const colorScheme = useColorScheme();
  useOnlineManager();
  useAppState(onAppStateChange);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <GualletClientProvider client={gualletClient}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
          <StatusBar style="auto" />
        </GualletClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
