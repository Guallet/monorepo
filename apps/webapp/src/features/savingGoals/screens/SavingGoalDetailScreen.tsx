import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SavingGoalDto } from '@guallet/api-client/src/savingGoals';
import { useSavingGoal, useAccounts } from '@guallet/api-react';
import {
  IconPigMoney,
  IconEdit,
  IconArrowLeft,
  IconCalendar,
  IconCurrencyDollar,
  IconBuildingBank,
  IconInfoCircle,
} from '@tabler/icons-react';
import { Money } from '@guallet/money';

function getDaysRemainingText(
  daysRemaining: number,
  isCompleted: boolean,
): string {
  if (daysRemaining > 0) {
    return `${daysRemaining} days remaining to reach your goal`;
  }
  if (isCompleted) {
    return "Congratulations! You've reached your goal!";
  }
  return `${Math.abs(daysRemaining)} days overdue`;
}

function getProgressBarClass(isCompleted: boolean, isOverdue: boolean): string {
  if (isCompleted) return 'bg-emerald-500';
  if (isOverdue) return 'bg-red-500';
  return 'bg-blue-500';
}

function getStatusInfo(
  isCompleted: boolean,
  isOverdue: boolean,
  daysRemaining: number,
): { label: string; className: string } {
  if (isCompleted) {
    return {
      label: 'Completed',
      className: 'bg-emerald-100 text-emerald-800',
    };
  }

  if (isOverdue) {
    return {
      label: 'Overdue',
      className: 'bg-red-100 text-red-800',
    };
  }

  if (daysRemaining <= 30) {
    return {
      label: 'Due Soon',
      className: 'bg-orange-100 text-orange-800',
    };
  }

  return {
    label: 'On Track',
    className: 'bg-blue-100 text-blue-800',
  };
}

interface SavingGoalDetailScreenProps {
  goalId: string;
  onEdit?: (goal: SavingGoalDto) => void;
  onBack?: () => void;
}

export function SavingGoalDetailScreen({
  goalId,
  onEdit,
  onBack,
}: Readonly<SavingGoalDetailScreenProps>) {
  const { savingGoal, isLoading, error } = useSavingGoal(goalId);
  const { accounts } = useAccounts();

  if (error) {
    return (
      <BaseScreen>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load saving goal details
          </AlertDescription>
        </Alert>
      </BaseScreen>
    );
  }

  if (!savingGoal) {
    return (
      <BaseScreen isLoading={isLoading}>
        <div />
      </BaseScreen>
    );
  }

  // Calculate progress and status
  const currentAmount = 0; // This will be calculated from linked accounts in the future
  const progress =
    savingGoal.target_amount > 0
      ? (currentAmount / savingGoal.target_amount) * 100
      : 0;
  const isCompleted = progress >= 100;
  const remainingAmount = Math.max(0, savingGoal.target_amount - currentAmount);

  const targetDate = new Date(savingGoal.target_date);
  const today = new Date();
  const isOverdue = targetDate < today && !isCompleted;
  const daysRemaining = Math.ceil(
    (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Get linked account details
  const linkedAccounts = accounts.filter((account) =>
    savingGoal.accounts.includes(account.id),
  );

  // Calculate monthly savings needed (simplified calculation)
  const monthsRemaining = Math.max(1, daysRemaining / 30);
  const monthlySavingsNeeded = remainingAmount / monthsRemaining;
  const statusInfo = getStatusInfo(isCompleted, isOverdue, daysRemaining);
  const progressBarClass = getProgressBarClass(isCompleted, isOverdue);

  return (
    <BaseScreen isLoading={isLoading}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {onBack ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onBack}
                aria-label="Go back"
              >
                <IconArrowLeft className="h-5 w-5" />
              </Button>
            ) : null}
            <IconPigMoney className="h-7 w-7" />
            <h1 className="truncate text-2xl font-bold">
              {savingGoal.name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-sm font-medium ${statusInfo.className}`}
            >
              {statusInfo.label}
            </span>
            {onEdit ? (
              <Button
                type="button"
                onClick={() => onEdit(savingGoal)}
                className="gap-2"
              >
                <IconEdit className="h-4 w-4" />
                Edit Goal
              </Button>
            ) : null}
          </div>
        </div>

        <Card className="rounded-lg border p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-lg font-semibold">Progress Overview</p>
              <p className="text-sm text-muted-foreground">
                {progress.toFixed(1)}% complete
              </p>
            </div>

            <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`${progressBarClass} h-full transition-all`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconCurrencyDollar className="h-4 w-4" />
                  <span>Current Amount</span>
                </div>
                <p className="text-lg font-semibold">
                  {Money.fromCurrencyCode({
                    amount: currentAmount,
                    currencyCode: 'GBP',
                  }).format()}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconPigMoney className="h-4 w-4" />
                  <span>Target Amount</span>
                </div>
                <p className="text-lg font-semibold">
                  {Money.fromCurrencyCode({
                    amount: savingGoal.target_amount,
                    currencyCode: 'GBP',
                  }).format()}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconCalendar className="h-4 w-4" />
                  <span>Target Date</span>
                </div>
                <p className="text-lg font-semibold">
                  {targetDate.toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconCurrencyDollar className="h-4 w-4" />
                  <span>Remaining</span>
                </div>
                <p
                  className={`text-lg font-semibold ${
                    isCompleted ? 'text-emerald-600' : ''
                  }`}
                >
                  {Money.fromCurrencyCode({
                    amount: remainingAmount,
                    currencyCode: 'GBP',
                  }).format()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {savingGoal.description ? (
          <Card className="rounded-lg border p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-lg font-semibold">Description</p>
              <p>{savingGoal.description}</p>
            </div>
          </Card>
        ) : null}

        <Card className="rounded-lg border p-6 shadow-sm">
          <div className="space-y-3">
            <p className="text-lg font-semibold">Insights</p>

            {!isCompleted && daysRemaining > 0 ? (
              <div className="flex items-start gap-2 text-sm">
                <IconInfoCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  You need to save approximately{' '}
                  <span className="font-semibold">
                    {Money.fromCurrencyCode({
                      amount: monthlySavingsNeeded,
                      currencyCode: 'GBP',
                    }).format()}
                  </span>{' '}
                  per month to reach your goal.
                </p>
              </div>
            ) : null}

            <div className="flex items-start gap-2 text-sm">
              <IconCalendar className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{getDaysRemainingText(daysRemaining, isCompleted)}</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-lg border p-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <IconBuildingBank className="h-5 w-5" />
              <p className="text-lg font-semibold">Linked Accounts</p>
            </div>

            {linkedAccounts.length > 0 ? (
              <ul className="space-y-2">
                {linkedAccounts.map((account) => (
                  <li
                    key={account.id}
                    className="flex items-center justify-between gap-2 rounded-md border p-2"
                  >
                    <span>{account.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {Money.fromCurrencyCode({
                        amount: account.balance.amount,
                        currencyCode: account.balance.currency,
                      }).format()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                No accounts linked to this goal. Link accounts to automatically
                track your progress.
              </p>
            )}
          </div>
        </Card>
      </div>
    </BaseScreen>
  );
}
