import { AiProvidersScreen } from '@/features/settings/screens/AiProvidersScreen';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/settings/ai_/providers')({
  component: AiProvidersPage,
});

function AiProvidersPage() {
  return <AiProvidersScreen />;
}
