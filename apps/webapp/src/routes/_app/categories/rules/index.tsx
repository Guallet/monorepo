import { RulesListScreen } from '@/features/rules/screens/RulesListScreen';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/categories/rules/')({
  component: RulesPage,
});

function RulesPage() {
  return <RulesListScreen />;
}
