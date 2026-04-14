import { createFileRoute } from '@tanstack/react-router';
import { TermsScreen } from '@/features/landing/screens/TermsScreen';

export const Route = createFileRoute('/terms')({
  component: TermsPage,
});

function TermsPage() {
  return <TermsScreen />;
}
