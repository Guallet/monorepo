import { AccountAvatar } from '@/components/AccountAvatar/AccountAvatar';
import { CategoryAvatar } from '@/components/Categories/CategoryAvatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocale } from '@/i18n/useLocale';
import { InboxTransactionDto } from '@guallet/api-client';
import { useAccount, useCategory } from '@guallet/api-react';
import { Money } from '@guallet/money';
import { IconCheck, IconEdit } from '@tabler/icons-react';

interface InboxTransactionCardProps {
  transaction: InboxTransactionDto;
  onEdit?: () => void;
  onSaveChanges?: () => void;
}

export function InboxTransactionCard({
  transaction,
  onEdit,
  onSaveChanges,
}: Readonly<InboxTransactionCardProps>) {
  const { account } = useAccount(transaction.accountId);
  const { category } = useCategory(
    transaction.processedCategoryId ?? transaction.categoryId,
  );
  const { locale } = useLocale();

  const formattedDate = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(transaction.date);

  return (
    <Card className="rounded-md border p-4 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AccountAvatar accountId={transaction.accountId} size={30} />
          <p className="flex-1">{account?.name}</p>
          <p className="font-semibold">{formattedDate}</p>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-start justify-between gap-2">
          <p className="flex-1">{transaction.description}</p>
          <p className="font-semibold">
            {Money.fromCurrencyCode({
              currencyCode: transaction.currency,
              amount: transaction.amount,
            }).format()}
          </p>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CategoryAvatar categoryId={transaction.categoryId} />
            <p className="text-sm">{category?.name ?? 'Unknown'}</p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="Edit"
              aria-label="Edit"
              onClick={() => onEdit?.()}
            >
              <IconEdit className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              title="Save"
              aria-label="Save"
              onClick={() => onSaveChanges?.()}
            >
              <IconCheck className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
