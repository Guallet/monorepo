import { NewAiAgentScreen } from '@/features/settings/screens/NewAiAgentScreen';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/settings/ai_/new')({
  component: NewAiAgentPage,
});

function NewAiAgentPage() {
  return <NewAiAgentScreen />;
}
