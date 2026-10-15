import { MortgageToolScreen } from '@/features/mortgage/screens/MortgageToolScreen';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/tools/mortgage')({
  component: MortgagePage,
});

function MortgagePage() {
  return <MortgageToolScreen />;
}
