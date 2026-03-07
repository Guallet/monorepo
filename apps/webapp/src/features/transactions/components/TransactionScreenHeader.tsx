import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface TransactionScreenHeaderProps {
  onAddTransaction: () => void;
}

export function TransactionScreenHeader({
  onAddTransaction,
}: Readonly<TransactionScreenHeaderProps>) {
  const { t } = useTranslation();
  const addLabel = t(
    'screens.transactions.list.header.add.tooltip',
    'Add new transaction',
  );

  return (
    <div className="flex items-center gap-2">
      <h2 className="flex-1 text-2xl font-semibold tracking-tight">
        {t('screens.transactions.list.header.title', 'Transactions')}
      </h2>
      <Button
        type="button"
        variant="outline"
        size="icon"
        title={addLabel}
        aria-label={addLabel}
        onClick={() => {
          onAddTransaction();
        }}
      >
        <IconPlus className="h-4 w-4" stroke={1.5} />
      </Button>
    </div>
  );
}
