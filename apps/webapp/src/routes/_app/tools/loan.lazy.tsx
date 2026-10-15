import { LoanCalculatorScreen } from '@/features/loans/screens/LoanCalculatorScreen';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/tools/loan')({
  component: LoanPage,
});

function LoanPage() {
  return <LoanCalculatorScreen />;
}
