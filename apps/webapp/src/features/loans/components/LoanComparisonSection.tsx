import { useTheme } from '@guallet/ui-react';
import { BarChart } from '@mantine/charts';
import { Alert, Badge, Card, Grid, Group, Stack, Text } from '@mantine/core';
import { IconInfoCircle, IconTrophy } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { LoanScenarioResult } from '../models/loan';

interface LoanComparisonSectionProps {
  loanA: LoanScenarioResult;
  loanB: LoanScenarioResult;
  currency: string;
  labelA?: string;
  labelB?: string;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

interface CompareMetricRowProps {
  label: string;
  valueA: string;
  valueB: string;
  winnerSide: 'a' | 'b' | 'equal';
  labelA: string;
  labelB: string;
}

function CompareMetricRow({
  label,
  valueA,
  valueB,
  winnerSide,
  labelA,
  labelB,
}: Readonly<CompareMetricRowProps>) {
  const { colors } = useTheme();

  return (
    <Grid align="center">
      <Grid.Col span={4}>
        <Text
          fw={winnerSide === 'a' ? 700 : 400}
          style={{
            fontVariantNumeric: 'tabular-nums',
            color: winnerSide === 'a' ? colors.success : undefined,
          }}
        >
          {valueA}
          {winnerSide === 'a' && (
            <Text component="span" size="xs" c="dimmed" ml={4}>
              ({labelA})
            </Text>
          )}
        </Text>
      </Grid.Col>
      <Grid.Col span={4}>
        <Text size="sm" c="dimmed" ta="center">
          {label}
        </Text>
      </Grid.Col>
      <Grid.Col span={4}>
        <Text
          fw={winnerSide === 'b' ? 700 : 400}
          ta="right"
          style={{
            fontVariantNumeric: 'tabular-nums',
            color: winnerSide === 'b' ? colors.success : undefined,
          }}
        >
          {valueB}
          {winnerSide === 'b' && (
            <Text component="span" size="xs" c="dimmed" ml={4}>
              ({labelB})
            </Text>
          )}
        </Text>
      </Grid.Col>
    </Grid>
  );
}

export function LoanComparisonSection({
  loanA,
  loanB,
  currency,
  labelA,
  labelB,
}: Readonly<LoanComparisonSectionProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();

  const resolvedLabelA =
    labelA ?? t('screens.tools.loan.compare.loanA', 'Loan A');
  const resolvedLabelB =
    labelB ?? t('screens.tools.loan.compare.loanB', 'Loan B');

  const costDiff = loanA.summary.totalCost - loanB.summary.totalCost;
  const winnerLabel =
    costDiff < 0
      ? resolvedLabelA
      : costDiff > 0
        ? resolvedLabelB
        : null;
  const saving = Math.abs(costDiff);

  const chartData = [
    {
      metric: t(
        'screens.tools.loan.compare.chart.monthlyPayment',
        'Monthly payment',
      ),
      [resolvedLabelA]: loanA.summary.monthlyPayment,
      [resolvedLabelB]: loanB.summary.monthlyPayment,
    },
    {
      metric: t(
        'screens.tools.loan.compare.chart.totalInterest',
        'Total interest',
      ),
      [resolvedLabelA]: loanA.summary.totalInterest,
      [resolvedLabelB]: loanB.summary.totalInterest,
    },
    {
      metric: t('screens.tools.loan.compare.chart.totalCost', 'Total cost'),
      [resolvedLabelA]: loanA.summary.totalCost,
      [resolvedLabelB]: loanB.summary.totalCost,
    },
  ];

  return (
    <Stack gap={spacing.md}>
      {winnerLabel ? (
        <Alert icon={<IconTrophy size={16} />} radius="lg" color="green">
          <Group justify="space-between" wrap="wrap">
            <Text>
              {t('screens.tools.loan.compare.winner', {
                label: winnerLabel,
                defaultValue: '{{label}} is cheaper overall',
              })}
            </Text>
            <Badge variant="light" color="green">
              {t('screens.tools.loan.compare.saving', {
                amount: formatCurrency(saving, currency),
                defaultValue: 'Save {{amount}}',
              })}
            </Badge>
          </Group>
        </Alert>
      ) : (
        <Alert icon={<IconInfoCircle size={16} />} radius="lg" color="primary">
          <Text>
            {t(
              'screens.tools.loan.compare.equal',
              'Both loans have the same total cost',
            )}
          </Text>
        </Alert>
      )}

      <Card withBorder shadow="sm" radius="lg" p="lg">
        <Stack gap={spacing.sm}>
          <Group justify="space-between">
            <Text fw={600} size="sm" style={{ flex: 1 }}>
              {resolvedLabelA}
            </Text>
            <Text fw={600} size="sm" c="dimmed" ta="center" style={{ flex: 1 }}>
              {t('screens.tools.loan.compare.metric', 'Metric')}
            </Text>
            <Text fw={600} size="sm" ta="right" style={{ flex: 1 }}>
              {resolvedLabelB}
            </Text>
          </Group>

          <CompareMetricRow
            label={t(
              'screens.tools.loan.metrics.monthlyPayment',
              'Monthly payment',
            )}
            valueA={formatCurrency(loanA.summary.monthlyPayment, currency)}
            valueB={formatCurrency(loanB.summary.monthlyPayment, currency)}
            winnerSide={
              loanA.summary.monthlyPayment < loanB.summary.monthlyPayment
                ? 'a'
                : loanA.summary.monthlyPayment > loanB.summary.monthlyPayment
                  ? 'b'
                  : 'equal'
            }
            labelA={resolvedLabelA}
            labelB={resolvedLabelB}
          />

          <CompareMetricRow
            label={t(
              'screens.tools.loan.metrics.totalInterest',
              'Total interest',
            )}
            valueA={formatCurrency(loanA.summary.totalInterest, currency)}
            valueB={formatCurrency(loanB.summary.totalInterest, currency)}
            winnerSide={
              loanA.summary.totalInterest < loanB.summary.totalInterest
                ? 'a'
                : loanA.summary.totalInterest > loanB.summary.totalInterest
                  ? 'b'
                  : 'equal'
            }
            labelA={resolvedLabelA}
            labelB={resolvedLabelB}
          />

          <CompareMetricRow
            label={t(
              'screens.tools.loan.metrics.totalRepayable',
              'Total repayable',
            )}
            valueA={formatCurrency(loanA.summary.totalPaid, currency)}
            valueB={formatCurrency(loanB.summary.totalPaid, currency)}
            winnerSide={
              loanA.summary.totalPaid < loanB.summary.totalPaid
                ? 'a'
                : loanA.summary.totalPaid > loanB.summary.totalPaid
                  ? 'b'
                  : 'equal'
            }
            labelA={resolvedLabelA}
            labelB={resolvedLabelB}
          />

          <CompareMetricRow
            label={t('screens.tools.loan.metrics.totalCost', 'Total cost')}
            valueA={formatCurrency(loanA.summary.totalCost, currency)}
            valueB={formatCurrency(loanB.summary.totalCost, currency)}
            winnerSide={
              loanA.summary.totalCost < loanB.summary.totalCost
                ? 'a'
                : loanA.summary.totalCost > loanB.summary.totalCost
                  ? 'b'
                  : 'equal'
            }
            labelA={resolvedLabelA}
            labelB={resolvedLabelB}
          />

          <CompareMetricRow
            label={t(
              'screens.tools.loan.metrics.termMonths',
              'Term (months)',
            )}
            valueA={String(loanA.summary.payoffMonths)}
            valueB={String(loanB.summary.payoffMonths)}
            winnerSide={
              loanA.summary.payoffMonths < loanB.summary.payoffMonths
                ? 'a'
                : loanA.summary.payoffMonths > loanB.summary.payoffMonths
                  ? 'b'
                  : 'equal'
            }
            labelA={resolvedLabelA}
            labelB={resolvedLabelB}
          />
        </Stack>
      </Card>

      <Card withBorder shadow="sm" radius="lg" p="lg">
        <Stack gap={spacing.sm}>
          <Text fw={600}>
            {t('screens.tools.loan.compare.chartTitle', 'Side-by-side comparison')}
          </Text>
          <BarChart
            h={280}
            data={chartData}
            dataKey="metric"
            series={[
              { name: resolvedLabelA, color: 'blue.6' },
              { name: resolvedLabelB, color: 'orange.6' },
            ]}
            tickLine="y"
          />
        </Stack>
      </Card>
    </Stack>
  );
}
