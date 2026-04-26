import { BalanceHistoryPoint } from '@guallet/api-client';
import { useTheme } from '@guallet/ui-react';
import { LineChart } from '@mantine/charts';
import { Card, Center, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface BalanceTrendChartProps {
  balanceHistory: BalanceHistoryPoint[];
  currency: string;
  isLoading?: boolean;
}

export function BalanceTrendChart({
  balanceHistory,
  currency,
  isLoading,
}: Readonly<BalanceTrendChartProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();

  const chartData = balanceHistory.map((point) => ({
    date: new Date(point.date).toLocaleDateString('default', {
      month: 'short',
      day: 'numeric',
    }),
    balance: point.balance,
  }));

  return (
    <Card withBorder shadow="sm" radius="lg" padding={{ base: 'md', sm: 'lg' }}>
      <Text fw={600} mb={spacing.sm}>
        {t('feature.accounts.details.balanceTrend.title', 'Balance over time')}
      </Text>

      {!isLoading && chartData.length === 0 ? (
        <Center h={200}>
          <Text c="dimmed">
            {t(
              'feature.accounts.details.balanceTrend.empty',
              'No balance data for this period',
            )}
          </Text>
        </Center>
      ) : (
        <LineChart
          h={200}
          data={chartData}
          dataKey="date"
          unit={` ${currency}`}
          withTooltip
          withDots={false}
          series={[{ name: 'balance', color: 'primary.6', label: currency }]}
          curveType="monotone"
        />
      )}
    </Card>
  );
}
