import { TransactionRow } from '@/features/transactions/components/TransactionRow';
import { useTransactionsWithFilter } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import { Button, Card, Center, Group, Loader, Stack, Text } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

const MAX_TRANSACTIONS = 15;

interface TransactionsSectionProps {
  accountId: string;
  startDate: Date;
  endDate: Date;
}

export function TransactionsSection({
  accountId,
  startDate,
  endDate,
}: Readonly<TransactionsSectionProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const navigation = useNavigate();

  const { transactions, isLoading } = useTransactionsWithFilter({
    page: 1,
    pageSize: MAX_TRANSACTIONS,
    accounts: [accountId],
    startDate,
    endDate,
  });

  const limited = transactions.slice(0, MAX_TRANSACTIONS);

  return (
    <Card withBorder shadow="sm" radius="lg" padding={{ base: 'md', sm: 'lg' }}>
      <Group justify="space-between" mb={spacing.sm}>
        <Text fw={600}>
          {t(
            'feature.accounts.details.transactions.title',
            'Latest transactions',
          )}
        </Text>
        <Button
          variant="subtle"
          size="xs"
          onClick={() =>
            navigation({
              to: '/transactions',
              search: {
                accounts: [accountId],
                page: 1,
                pageSize: 50,
              },
            })
          }
        >
          {t('feature.accounts.details.transactions.viewAll', 'View all')}
        </Button>
      </Group>

      {isLoading ? (
        <Center py={spacing.lg}>
          <Loader size="sm" />
        </Center>
      ) : limited.length === 0 ? (
        <Center py={spacing.lg}>
          <Text c="dimmed">
            {t(
              'feature.accounts.details.transactions.empty',
              'No transactions for this period',
            )}
          </Text>
        </Center>
      ) : (
        <Stack gap={0}>
          {limited.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              avatarType="category"
            />
          ))}
        </Stack>
      )}
    </Card>
  );
}
