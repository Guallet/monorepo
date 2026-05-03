import { NewRuleScreen } from '@/features/rules/screens/NewRuleScreen';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/categories/rules/new')({
  component: NewRulePage,
});

function NewRulePage() {
  return <NewRuleScreen />;
}
