import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@guallet/auth';
import { ImportDraftProvider } from '@/features/importer/ImportDraftProvider';

export default function ImporterLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/login" />;
  return (
    <ImportDraftProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ImportDraftProvider>
  );
}
