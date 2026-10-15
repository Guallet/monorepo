import { Stack } from 'expo-router/stack';
import { ImportDraftProvider } from '@/features/importer/ImportDraftProvider';

export default function ImporterLayout() {
  return (
    <ImportDraftProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ImportDraftProvider>
  );
}
