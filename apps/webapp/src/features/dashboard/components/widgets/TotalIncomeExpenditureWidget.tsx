import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { WidgetCard } from './WidgetCard';
import { useTransactionsWithFilter } from '@guallet/api-react';
import { Money } from '@guallet/money';
import {
  Loader,
  Stack,
  Text,
  Group,
  Box,
  useMantineTheme,
  Center,
  RingProgress,
} from '@mantine/core';
import { IconArrowUp, IconArrowDown, IconChartPie } from '@tabler/icons-react';

interface TotalIncomeExpenditureWidgetProps {
  startDate: string | null;
  endDate: string | null;
}

export function TotalIncomeExpenditureWidget({
  startDate,
  endDate,
}: Readonly<TotalIncomeExpenditureWidgetProps>) {
  const { transactions, isLoading } = useTransactionsWithFilter({
    page: 1,
    pageSize: 1000,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
  });

  const theme = useMantineTheme();

  // Calculate total income and expenditure
  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const expenditure = Math.abs(
    transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0),
  );

  const defaultCurrencyCode = useDefaultCurrency();
  const currencyCode = transactions.length
    ? transactions[0].currency
    : defaultCurrencyCode;

  const total = income + expenditure;
  const incomePercent = total > 0 ? (income / total) * 100 : 50;
  const balance = income - expenditure;

  return (
    <WidgetCard title="Income vs Expenditure" icon={<IconChartPie size={20} />}>
      {isLoading ? (
        <Center h={200}>
          <Loader size="md" />
        </Center>
      ) : (
        <Stack gap="lg" align="center">
          <Center>
            <RingProgress
              size={180}
              thickness={20}
              sections={[
                { value: incomePercent, color: 'teal', tooltip: 'Income' },
                {
                  value: 100 - incomePercent,
                  color: 'red',
                  tooltip: 'Expenditure',
                },
              ]}
              label={
                <Center>
                  <Stack gap={0} align="center">
                    <Text size="xs" c="dimmed" fw={500}>
                      Balance
                    </Text>
                    <Text size="lg" fw={700} c={balance >= 0 ? 'teal' : 'red'}>
                      {balance >= 0 ? '+' : ''}
                      {Money.fromCurrencyCode({
                        amount: balance,
                        currencyCode,
                      }).format()}
                    </Text>
                  </Stack>
                </Center>
              }
            />
          </Center>

          <Group grow style={{ width: '100%' }}>
            <Box
              p="md"
              style={{
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.teal[0],
                border: `1px solid ${theme.colors.teal[2]}`,
              }}
            >
              <Group gap="xs" mb="xs">
                <IconArrowUp size={20} color={theme.colors.teal[6]} />
                <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                  Income
                </Text>
              </Group>
              <Text size="xl" fw={700} c="teal">
                {Money.fromCurrencyCode({
                  amount: income,
                  currencyCode: currencyCode,
                }).format()}
              </Text>
            </Box>

            <Box
              p="md"
              style={{
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.red[0],
                border: `1px solid ${theme.colors.red[2]}`,
              }}
            >
              <Group gap="xs" mb="xs">
                <IconArrowDown size={20} color={theme.colors.red[6]} />
                <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                  Expenditure
                </Text>
              </Group>
              <Text size="xl" fw={700} c="red">
                {expenditure.toFixed(0)}
              </Text>
            </Box>
          </Group>
        </Stack>
      )}
    </WidgetCard>
  );
}
