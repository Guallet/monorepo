import { NewAiProviderScreen } from '@/features/settings/screens/NewAiProviderScreen';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/settings/ai_/providers_/new')({
  component: NewAiProviderPage,
});

function NewAiProviderPage() {
  return <NewAiProviderScreen />;
}
