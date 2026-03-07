import { AccountAvatar } from '@/components/AccountAvatar/AccountAvatar';
import { CategoryAvatar } from '@/components/Categories/CategoryAvatar';
import { TransactionDto } from '@guallet/api-client';
import { Money } from '@guallet/money';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

type AvatarType = 'account' | 'category';

interface TransactionRowProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onClick'
> {
  transaction: TransactionDto;
  avatarType: AvatarType;
  showNotes?: boolean;
  onClick?: (transaction: TransactionDto) => void;
}

export function TransactionRow({
  transaction,
  avatarType = 'account',
  showNotes = false,
  onClick,
  className,
  ...props
}: Readonly<TransactionRowProps>) {
  const money = useMemo(
    () =>
      Money.fromCurrencyCode({
        amount: transaction.amount,
        currencyCode: transaction.currency,
      }),
    [transaction],
  );

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3',
        onClick ? 'cursor-pointer transition-colors hover:bg-accent/40' : null,
        className,
      )}
      {...(onClick
        ? {
            role: 'button' as const,
            tabIndex: 0,
            onClick: () => onClick(transaction),
            onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick(transaction);
              }
            },
          }
        : null)}
      {...props}
    >
      {avatarType === 'category' ? (
        <CategoryAvatar categoryId={transaction.categoryId} />
      ) : (
        <AccountAvatar accountId={transaction.accountId} />
      )}
      <div className="min-w-0 flex-1 space-y-0.5 overflow-hidden">
        <p className="truncate">{transaction.description}</p>
        {showNotes && transaction.notes ? (
          <p className="truncate text-xs text-muted-foreground">
            {transaction.notes}
          </p>
        ) : null}
      </div>
      <p className="font-bold">{money?.format()}</p>
    </div>
  );
}
