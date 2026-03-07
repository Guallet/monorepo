import { SavingGoalDto } from '@guallet/api-client/src/savingGoals';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { IconPigMoney, IconEdit, IconTrash } from '@tabler/icons-react';
import { Money } from '@guallet/money';

function getProgressBarClass(isCompleted: boolean, isOverdue: boolean): string {
  if (isCompleted) return 'green';
  if (isOverdue) return 'red';
  return 'blue';
}

interface SavingGoalRowProps {
  savingGoal: SavingGoalDto;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SavingGoalRow({
  savingGoal,
  onClick,
  onEdit,
  onDelete,
}: Readonly<SavingGoalRowProps>) {
  // For now, we'll calculate progress as 0% since we don't have current amount
  // This should be calculated based on the actual amount saved from linked accounts
  const currentAmount = 0; // This will be calculated from linked accounts in the future
  const progress =
    savingGoal.target_amount > 0
      ? (currentAmount / savingGoal.target_amount) * 100
      : 0;
  const isCompleted = progress >= 100;
  const accountPluralSuffix = savingGoal.accounts.length === 1 ? '' : 's';

  const targetDate = new Date(savingGoal.target_date);
  const isOverdue = targetDate < new Date() && !isCompleted;

  const handleCardClick = () => {
    onClick();
  };

  const progressBarClass = getProgressBarClass(isCompleted, isOverdue);

  return (
    <Card
      className="cursor-pointer border p-4 shadow-sm transition-colors hover:bg-accent/20"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <IconPigMoney className="h-5 w-5" />
          <p className="truncate text-lg font-medium">{savingGoal.name}</p>
        </div>

        <div className="flex items-center gap-1">
          {isCompleted ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
              Completed
            </span>
          ) : null}

          {isOverdue ? (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
              Overdue
            </span>
          ) : null}

          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <IconEdit className="h-4 w-4" />
            </Button>
          )}

          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {savingGoal.description ? (
        <p className="mb-3 text-sm text-muted-foreground">
          {savingGoal.description}
        </p>
      ) : null}

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Progress
          </p>
          <p className="text-sm font-medium">
            {Money.fromCurrencyCode({
              amount: currentAmount,
              currencyCode: 'GBP',
            }).format()}{' '}
            /{' '}
            {Money.fromCurrencyCode({
              amount: savingGoal.target_amount,
              currencyCode: 'GBP',
            }).format()}
          </p>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn('h-full transition-all', {
              'bg-emerald-500': progressBarClass === 'green',
              'bg-red-500': progressBarClass === 'red',
              'bg-blue-500': progressBarClass === 'blue',
            })}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {progress.toFixed(1)}% complete
          </p>
          <p className="text-xs text-muted-foreground">
            Target: {targetDate.toLocaleDateString()}
          </p>
        </div>

        {savingGoal.accounts.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            {savingGoal.accounts.length} account{accountPluralSuffix} linked
          </p>
        ) : null}
      </div>
    </Card>
  );
}
