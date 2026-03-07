import EmptyState from '@/components/EmptyState/EmptyState';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Button } from '@/components/ui/button';
import { useBudgets } from '@guallet/api-react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { BudgetCard } from '../components/BudgetCard';
import { BudgetListHeader } from '../components/BudgetListHeader';

export function BudgetListScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { budgets, isLoading } = useBudgets();

  return (
    <BaseScreen isLoading={isLoading}>
      {budgets.length === 0 ? (
        <EmptyState
          text={t(
            'screens.budgets.list.emptyState',
            'No Budgets Found. Create a new budget to get started.',
          )}
          iconName="IconPlus"
          onClick={() => {
            navigate({ to: '/budgets/create' });
          }}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={() => {
              navigate({ to: '/budgets/create' });
            }}
          >
            {t(
              'screens.budgets.list.createBudgetButton.label',
              'Create new Budget',
            )}
          </Button>

          <BudgetListHeader budgets={budgets} />

          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budgetId={budget.id}
              onClick={() => {
                navigate({
                  to: '/budgets/$id',
                  params: {
                    id: budget.id,
                  },
                });
              }}
            />
          ))}
        </div>
      )}
    </BaseScreen>
  );
}
