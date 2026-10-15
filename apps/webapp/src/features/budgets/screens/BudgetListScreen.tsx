import { BaseScreen } from '@/components/Screens/BaseScreen';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { MonthSelectorHeader } from '@/components/MonthSelectorHeader/MonthSelectorHeader';
import { useBudgets } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import { Button, Stack } from '@mantine/core';
import { IconPlus, IconChartBar } from '@tabler/icons-react';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { BudgetCard } from '../components/BudgetCard';
import { BudgetListHeader } from '../components/BudgetListHeader';

export function BudgetListScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { spacing } = useTheme();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const month = selectedDate.getMonth() + 1;
  const year = selectedDate.getFullYear();

  const { budgets, isLoading } = useBudgets({ month, year });

  return (
    <BaseScreen
      isLoading={isLoading}
      title={t('screens.budgets.list.title', 'Budgets')}
      actions={
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            navigate({ to: '/budgets/create' });
          }}
        >
          {t('screens.budgets.list.createBudgetButton.label', 'New budget')}
        </Button>
      }
    >
      <Stack gap={spacing.sm}>
        <MonthSelectorHeader
          date={selectedDate}
          onDateChanged={setSelectedDate}
        />

        {budgets.length === 0 && !isLoading ? (
          <EmptyState
            illustration={
              <IconChartBar
                size={48}
                strokeWidth={1.5}
                color="var(--mantine-color-gray-5)"
              />
            }
            title={t('screens.budgets.list.emptyState.title', 'No budgets yet')}
            description={t(
              'screens.budgets.list.emptyState.description',
              'Create your first budget to start tracking and controlling your spending.',
            )}
            primaryAction={{
              label: t(
                'screens.budgets.list.createBudgetButton.label',
                'New budget',
              ),
              icon: <IconPlus size={16} />,
              onClick: () => navigate({ to: '/budgets/create' }),
            }}
            traits={[
              {
                title: t(
                  'screens.budgets.list.emptyState.trait1.title',
                  'Set a limit',
                ),
                body: t(
                  'screens.budgets.list.emptyState.trait1.body',
                  'Define a monthly spending cap for any category.',
                ),
              },
              {
                title: t(
                  'screens.budgets.list.emptyState.trait2.title',
                  'Track progress',
                ),
                body: t(
                  'screens.budgets.list.emptyState.trait2.body',
                  'See at a glance how much you have left to spend.',
                ),
              },
              {
                title: t(
                  'screens.budgets.list.emptyState.trait3.title',
                  'Stay in control',
                ),
                body: t(
                  'screens.budgets.list.emptyState.trait3.body',
                  'Get notified before you go over your limit.',
                ),
              },
            ]}
          />
        ) : (
          <>
            <BudgetListHeader budgets={budgets} />
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budgetId={budget.id}
                month={month}
                year={year}
                onClick={() => {
                  navigate({
                    to: '/budgets/$id',
                    params: { id: budget.id },
                  });
                }}
              />
            ))}
          </>
        )}
      </Stack>
    </BaseScreen>
  );
}
