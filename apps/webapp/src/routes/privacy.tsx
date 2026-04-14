import { createFileRoute } from '@tanstack/react-router';
import { PrivacyScreen } from '@/features/landing/screens/PrivacyScreen';

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
});

function PrivacyPage() {
  return <PrivacyScreen />;
}
