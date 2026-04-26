import { AccountChartData } from '@guallet/api-client';
import { useTheme } from '@guallet/ui-react';
import { BarChart } from '@mantine/charts';
import { Card, Center, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface MonthlyInOutChartProps {
  chart: AccountChartData[];
  currency: string;
  isLoading?: boolean;
}

function compareChartItems(a: AccountChartData, b: AccountChartData): number {
  return new Date(a.year, a.month, 1).getTime() - new Date(b.year, b.month, 1).getTime();
}

export function MonthlyInOutChart({
  chart,
  currency,
  isLoading,
}: Readonly<MonthlyInOutChartProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();

  const chartData = chart.sort(compareChartItems).map((x) => ({
    month: new Date(x.year, x.month, 1).toLocaleString('default', {
      month: 'short',
      year: '2-digit',
    }),
    in: Math.abs(x.total_in),
    out: Math.abs(x.total_out),
  }));

  return (
    <Card withBorder shadow="sm" radius="lg" padding={{ base: 'md', sm: 'lg' }}>
      <Text fw={600} mb={spacing.sm}>
        {t(
          'feature.accounts.details.monthlyInOut.title',
          'Monthly income vs spending',
        )}
      </Text>

      {!isLoading && chartData.length === 0 ? (
        <Center h={200}>
          <Text c="dimmed">
            {t(
              'feature.accounts.details.monthlyInOut.empty',
              'No transaction data for this period',
            )}
          </Text>
        </Center>
      ) : (
        <BarChart
          h={200}
          data={chartData}
          dataKey="month"
          unit={` ${currency}`}
          withTooltip
          withLegend
          series={[
            {
              name: 'in',
              color: 'green.5',
              label: t('feature.accounts.details.monthlyInOut.income', 'Income'),
            },
            {
              name: 'out',
              color: 'red.5',
              label: t(
                'feature.accounts.details.monthlyInOut.spending',
                'Spending',
              ),
            },
          ]}
        />
      )}
    </Card>
  );
}
