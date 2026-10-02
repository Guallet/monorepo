import { useAuth } from '@guallet/auth';
import { Redirect, Stack } from 'expo-router';

export default function ExportLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/login" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
