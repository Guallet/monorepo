import { useLocalSearchParams } from 'expo-router';
import { BudgetDetailScreen } from '@/features/budgets/screens/BudgetDetailScreen';

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <BudgetDetailScreen budgetId={id} />;
}
