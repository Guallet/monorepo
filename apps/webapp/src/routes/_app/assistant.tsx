import { AiAssistantScreen } from '@/features/assistant/screens/AiAssistantScreen';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/assistant')({
  component: AiAssistantPage,
});

function AiAssistantPage() {
  return <AiAssistantScreen />;
}
