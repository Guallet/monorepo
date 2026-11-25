import { createFileRoute } from '@tanstack/react-router';
import { MoneyFlowScreen } from '@/features/reports/screens/MoneyFlowScreen';

export const Route = createFileRoute('/_app/reports/money-flow')({
  component: MoneyFlowScreen,
});
