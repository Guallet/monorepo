import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { useTheme } from '@guallet/ui-react';
import { Badge, Card, Grid, Group, Stack, Tabs, Text } from '@mantine/core';
import {
  IconCalculator,
  IconCoin,
  IconCurrencyDollar,
  IconScaleOutline,
} from '@tabler/icons-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LoanAmortizationTable } from '../components/LoanAmortizationTable';
import { LoanCalculatorForm } from '../components/LoanCalculatorForm';
import { LoanComparisonSection } from '../components/LoanComparisonSection';
import {
  calculateLoanSchedule,
  type LoanCalculatorValues,
} from '../models/loan';

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getCurrencySymbol(currency: string): string {
  const formatted = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).formatToParts(0);

  return formatted.find((part) => part.type === 'currency')?.value ?? currency;
}

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

function MetricCard({
  icon,
  label,
  value,
  highlight = false,
}: Readonly<MetricCardProps>) {
  const { colors, spacing } = useTheme();

  return (
    <Card withBorder shadow="sm" radius="lg" p="lg">
      <Stack gap={spacing.xs}>
        <Group justify="space-between" wrap="nowrap">
          <Text size="sm" c="dimmed">
            {label}
          </Text>
          {icon}
        </Group>
        <Text
          fw={700}
          size="xl"
          style={{
            fontVariantNumeric: 'tabular-nums',
            color: highlight ? colors.success : undefined,
          }}
        >
          {value}
        </Text>
      </Stack>
    </Card>
  );
}

const DEFAULT_LOAN_A: LoanCalculatorValues = {
  amount: 10000,
  annualInterestRate: 6.9,
  termMonths: 60,
  arrangementFee: 0,
};

const DEFAULT_LOAN_B: LoanCalculatorValues = {
  amount: 10000,
  annualInterestRate: 8.5,
  termMonths: 48,
  arrangementFee: 150,
};

export function LoanCalculatorScreen() {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const defaultCurrency = useDefaultCurrency();
  const currencySymbol = getCurrencySymbol(defaultCurrency);

  const [loanA, setLoanA] = useState<LoanCalculatorValues>(DEFAULT_LOAN_A);
  const [loanB, setLoanB] = useState<LoanCalculatorValues>(DEFAULT_LOAN_B);

  const resultA = calculateLoanSchedule(loanA);
  const resultB = calculateLoanSchedule(loanB);

  const handleLoanAChange = <K extends keyof LoanCalculatorValues>(
    field: K,
    value: LoanCalculatorValues[K],
  ) => setLoanA((prev) => ({ ...prev, [field]: value }));

  const handleLoanBChange = <K extends keyof LoanCalculatorValues>(
    field: K,
    value: LoanCalculatorValues[K],
  ) => setLoanB((prev) => ({ ...prev, [field]: value }));

  return (
    <BaseScreen title={t('screens.tools.loan.title', 'Loan calculator')}>
      <Stack p="md" gap={spacing.md}>
        <Tabs defaultValue="calculator">
          <Tabs.List>
            <Tabs.Tab
              value="calculator"
              leftSection={<IconCalculator size={16} />}
            >
              {t('screens.tools.loan.tabs.calculator', 'Calculator')}
            </Tabs.Tab>
            <Tabs.Tab
              value="compare"
              leftSection={<IconScaleOutline size={16} />}
            >
              {t('screens.tools.loan.tabs.compare', 'Compare loans')}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="calculator" pt="md">
            <Stack gap={spacing.md}>
              <LoanCalculatorForm
                currency={currencySymbol}
                values={loanA}
                onChange={handleLoanAChange}
              />

              <Grid gap="md">
                <Grid.Col span={{ base: 12, sm: 6, xl: 3 }}>
                  <MetricCard
                    icon={<IconCoin size={20} />}
                    label={t(
                      'screens.tools.loan.metrics.monthlyPayment',
                      'Monthly payment',
                    )}
                    value={formatCurrency(
                      resultA.summary.monthlyPayment,
                      defaultCurrency,
                    )}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, xl: 3 }}>
                  <MetricCard
                    icon={<IconCurrencyDollar size={20} />}
                    label={t(
                      'screens.tools.loan.metrics.totalRepayable',
                      'Total repayable',
                    )}
                    value={formatCurrency(
                      resultA.summary.totalPaid,
                      defaultCurrency,
                    )}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, xl: 3 }}>
                  <MetricCard
                    icon={<IconCoin size={20} />}
                    label={t(
                      'screens.tools.loan.metrics.totalInterest',
                      'Total interest',
                    )}
                    value={formatCurrency(
                      resultA.summary.totalInterest,
                      defaultCurrency,
                    )}
                  />
                </Grid.Col>

                {loanA.arrangementFee > 0 && (
                  <Grid.Col span={{ base: 12, sm: 6, xl: 3 }}>
                    <MetricCard
                      icon={<IconCurrencyDollar size={20} />}
                      label={t(
                        'screens.tools.loan.metrics.totalCost',
                        'Total cost (inc. fee)',
                      )}
                      value={formatCurrency(
                        resultA.summary.totalCost,
                        defaultCurrency,
                      )}
                    />
                  </Grid.Col>
                )}
              </Grid>

              <Card withBorder shadow="sm" radius="lg" p="lg">
                <Group justify="space-between" wrap="wrap">
                  <Text size="sm" c="dimmed">
                    {t(
                      'screens.tools.loan.overview.costBreakdown',
                      'Interest as % of loan',
                    )}
                  </Text>
                  <Badge variant="light">
                    {loanA.amount > 0
                      ? `${((resultA.summary.totalInterest / loanA.amount) * 100).toFixed(1)}%`
                      : '—'}
                  </Badge>
                </Group>
              </Card>

              <LoanAmortizationTable
                rows={resultA.schedule}
                currency={defaultCurrency}
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="compare" pt="md">
            <Stack gap={spacing.md}>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <LoanCalculatorForm
                    currency={currencySymbol}
                    values={loanA}
                    onChange={handleLoanAChange}
                    label={t('screens.tools.loan.compare.loanA', 'Loan A')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <LoanCalculatorForm
                    currency={currencySymbol}
                    values={loanB}
                    onChange={handleLoanBChange}
                    label={t('screens.tools.loan.compare.loanB', 'Loan B')}
                  />
                </Grid.Col>
              </Grid>

              <LoanComparisonSection
                loanA={resultA}
                loanB={resultB}
                currency={defaultCurrency}
                labelA={t('screens.tools.loan.compare.loanA', 'Loan A')}
                labelB={t('screens.tools.loan.compare.loanB', 'Loan B')}
              />
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </BaseScreen>
  );
}
