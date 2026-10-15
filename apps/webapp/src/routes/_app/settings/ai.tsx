import { AiSettingsScreen } from '@/features/settings/screens/AiSettingsScreen';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/settings/ai')({
  component: AiSettingsPage,
});

function AiSettingsPage() {
  return <AiSettingsScreen />;
}
