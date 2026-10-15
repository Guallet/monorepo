import { StampDutyCalculatorScreen } from '@/features/stampDuty/screens/StampDutyCalculatorScreen';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_app/tools/stamp-duty')({
  component: StampDutyPage,
});

function StampDutyPage() {
  return <StampDutyCalculatorScreen />;
}
