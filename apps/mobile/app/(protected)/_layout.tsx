import { ImportJobMonitor } from '@/features/importer/ImportJobMonitor';
import { useNavigationScreenOptions } from '@/hooks/navigation-screen-options';
import { Stack } from 'expo-router/stack';

export const unstable_settings = { anchor: '(tabs)' };

export default function ProtectedLayout() {
  const screenOptions = useNavigationScreenOptions();
  return (
    <>
      <ImportJobMonitor />
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="saving-goals" options={{ headerShown: false }} />
        <Stack.Screen name="accounts" options={{ headerShown: false }} />
        <Stack.Screen name="transactions" options={{ headerShown: false }} />
        <Stack.Screen name="export" options={{ headerShown: false }} />
        <Stack.Screen name="importer" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
