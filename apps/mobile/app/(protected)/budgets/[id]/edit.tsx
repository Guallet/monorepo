import { useLocalSearchParams } from 'expo-router';
import { useBudget } from '@guallet/api-react';
import BudgetFormScreen from '@/features/budgets/screens/BudgetFormScreen';

export default function EditBudgetRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { budget, isError, isLoading, refetch } = useBudget(id);

  return (
    <BudgetFormScreen
      budget={budget}
      isError={isError}
      isLoading={isLoading}
      onRetry={() => void refetch()}
    />
  );
}
