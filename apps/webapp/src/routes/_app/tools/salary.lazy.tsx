import { SalaryCalculatorScreen } from '@/features/salary/screens/SalaryCalculatorScreen';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/tools/salary')({
  component: SalaryPage,
});

function SalaryPage() {
  return <SalaryCalculatorScreen />;
}
