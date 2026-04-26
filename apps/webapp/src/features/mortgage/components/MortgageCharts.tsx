import { BarChart, LineChart } from '@mantine/charts';
import { useTheme } from '@guallet/ui-react';
import { Card, Grid, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
  MortgageBalanceComparisonRow,
  MortgageYearlyBreakdownRow,
} from '../models/mortgage';

interface MortgageChartsProps {
  balanceData: MortgageBalanceComparisonRow[];
  yearlyBreakdown: MortgageYearlyBreakdownRow[];
  currency: string;
}

export function MortgageCharts({
  balanceData,
  yearlyBreakdown,
  currency,
}: Readonly<MortgageChartsProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();

  return (
    <Grid gap="md">
      <Grid.Col span={{ base: 12, xl: 7 }}>
        <Card withBorder shadow="sm" radius="lg" p="lg">
          <Stack gap={spacing.sm}>
            <Text fw={600}>
              {t(
                'screens.tools.mortgage.charts.balanceTitle',
                'Balance over time',
              )}
            </Text>
            <LineChart
              h={280}
              data={balanceData}
              dataKey="period"
              withTooltip
              withLegend
              unit={` ${currency}`}
              series={[
                {
                  name: 'baseline',
                  color: 'primary.6',
                  label: t(
                    'screens.tools.mortgage.charts.balanceBaseline',
                    'Base mortgage',
                  ),
                },
                {
                  name: 'repayment',
                  color: 'success.6',
                  label: t(
                    'screens.tools.mortgage.charts.balanceRepayment',
                    'Repayment plan',
                  ),
                },
              ]}
              curveType="natural"
              withDots={false}
            />
          </Stack>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, xl: 5 }}>
        <Card withBorder shadow="sm" radius="lg" p="lg">
          <Stack gap={spacing.sm}>
            <Text fw={600}>
              {t(
                'screens.tools.mortgage.charts.breakdownTitle',
                'Annual payment mix',
              )}
            </Text>
            <BarChart
              h={280}
              data={yearlyBreakdown}
              dataKey="year"
              withTooltip
              withLegend
              unit={` ${currency}`}
              series={[
                {
                  name: 'principal',
                  color: 'primary.5',
                  label: t(
                    'screens.tools.mortgage.charts.breakdownPrincipal',
                    'Principal',
                  ),
                },
                {
                  name: 'interest',
                  color: 'error.5',
                  label: t(
                    'screens.tools.mortgage.charts.breakdownInterest',
                    'Interest',
                  ),
                },
                {
                  name: 'extra',
                  color: 'success.5',
                  label: t(
                    'screens.tools.mortgage.charts.breakdownExtra',
                    'Overpayment',
                  ),
                },
              ]}
            />
          </Stack>
        </Card>
      </Grid.Col>
    </Grid>
  );
}
