import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Button } from '@/components/ui/button';
import {
  useBudget,
  useBudgetMutations,
  useBudgetTransactions,
} from '@guallet/api-react';
import { BudgetCard } from '../components/BudgetCard';
import { useState } from 'react';
import { MonthSelectorHeader } from '@/components/MonthSelectorHeader/MonthSelectorHeader';
import { useTranslation } from 'react-i18next';
import { AppSection } from '@/components/Cards/AppSection';
import { TransactionRow } from '@/features/transactions/components/TransactionRow';
import { IconEdit } from '@tabler/icons-react';
import { notifications } from '@/lib/notifications';
import { useNavigate } from '@tanstack/react-router';
import { DeleteIconButton } from '@/components/Buttons/DeleteButton';

interface BudgetDetailsScreenProps {
  budgetId: string;
}

export function BudgetDetailsScreen({
  budgetId,
}: Readonly<BudgetDetailsScreenProps>) {
  const { t } = useTranslation();
  const { deleteBudgetMutation } = useBudgetMutations();
  const { budget, isLoading } = useBudget(budgetId);

  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { transactions } = useBudgetTransactions({
    budgetId,
    args: {
      month: selectedDate.getMonth() + 1,
      year: selectedDate.getFullYear(),
    },
  });

  return (
    <BaseScreen isLoading={isLoading}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h1 className="flex-1 text-2xl font-semibold tracking-tight">
            {budget?.name}
          </h1>

          <Button
            type="button"
            variant="outline"
            size="icon"
            title={t('screens.budgets.details.editButton.tooltip', 'Edit')}
            aria-label={t(
              'screens.budgets.details.editButton.tooltip',
              'Edit',
            )}
            onClick={() => {
              console.log('Edit budget');
            }}
          >
            <IconEdit className="h-4 w-4" stroke={1.5} />
          </Button>

          <DeleteIconButton
            tooltipText={t(
              'screens.budgets.details.deleteButton.tooltip',
              'Delete',
            )}
            modalTitle={t(
              'screens.budgets.details.delete.dialog.title',
              'Deleted budget',
            )}
            modalMessage={t(
              'screens.budgets.details.delete.dialog.message',
              'Are you sure you want to delete the budget?',
            )}
            onDelete={() => {
              deleteBudgetMutation.mutate(budgetId, {
                onSuccess: () => {
                  notifications.show({
                    title: t(
                      'screens.budgets.details.delete.notifications.title',
                      'Budget deleted',
                    ),
                    message: t(
                      'screens.budgets.details.delete.notifications.message',
                      'The budget has been deleted.',
                    ),
                  });
                  navigate({ to: '/budgets' });
                },
                onError: () => {
                  notifications.show({
                    title: t(
                      'screens.budgets.details.delete.notifications.error.title',
                      'Error deleting budget',
                    ),
                    message: t(
                      'screens.budgets.details.delete.notifications.error.message',
                      'An error occurred while deleting the budget.',
                    ),
                  });
                },
              });
            }}
          />
        </div>

        <MonthSelectorHeader
          className="max-w-md"
          date={selectedDate}
          onDateChanged={(newDate: Date) => {
            setSelectedDate(newDate);
          }}
        />

        {budget && <BudgetCard budgetId={budget.id} />}

        <h2 className="text-xl font-semibold">
          {t('screens.budgets.details.transactions.title', 'Transactions')}
        </h2>

        <AppSection>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                avatarType="category"
              />
            ))
          ) : (
            <EmptyTransactionsView />
          )}
        </AppSection>
      </div>
    </BaseScreen>
  );
}

function EmptyTransactionsView() {
  const { t } = useTranslation();
  return (
    <div className="text-sm text-muted-foreground">
      <p>
        {t(
          'screens.budgets.details.transactions.emptyView.body',
          'No transactions found for the current selected month',
        )}
      </p>
    </div>
  );
}
