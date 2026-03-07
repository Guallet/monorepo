import { AppSection } from '@/components/Cards/AppSection';
import { Button } from '@/components/ui/button';
import { TransactionRow } from '@/features/transactions/components/TransactionRow';
import { useAccountTransactions } from '@guallet/api-react';
import { useNavigate } from '@tanstack/react-router';

interface TransactionsSectionProps {
  accountId: string;
}

export function TransactionsSection({
  accountId,
}: Readonly<TransactionsSectionProps>) {
  const navigation = useNavigate();
  const { transactions, isLoading } = useAccountTransactions(accountId);

  const renderTransactionsContent = () => {
    if (isLoading) {
      return (
        <div className="py-4 text-center text-sm text-muted-foreground">
          Loading...
        </div>
      );
    }

    if (transactions.length === 0) {
      return (
        <div className="py-4 text-center text-sm text-muted-foreground">
          No transactions found for this month
        </div>
      );
    }

    return (
      <div className="space-y-0">
        {transactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            avatarType={'category'}
          />
        ))}
      </div>
    );
  };

  return (
    <AppSection
      title="Latest transactions"
      headerActions={
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            navigation({
              to: '/transactions',
              search: {
                accounts: [accountId],
                page: 1,
                pageSize: 50,
              },
            });
          }}
        >
          View all
        </Button>
      }
    >
      {renderTransactionsContent()}
    </AppSection>
  );
}
