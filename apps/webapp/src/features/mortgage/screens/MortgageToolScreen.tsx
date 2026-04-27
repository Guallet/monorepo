import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { useTheme } from '@guallet/ui-react';
import {
  Alert,
  Badge,
  Card,
  Grid,
  Group,
  ScrollArea,
  Stack,
  Table,
  Tabs,
  Text,
} from '@mantine/core';
import type { TFunction } from 'i18next';
import {
  IconChartLine,
  IconClockHour4,
  IconCoin,
  IconHomeDollar,
  IconInfoCircle,
  IconPigMoney,
} from '@tabler/icons-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MortgageCalculatorForm } from '../components/MortgageCalculatorForm';
import { MortgageCharts } from '../components/MortgageCharts';
import {
  buildBalanceComparison,
  buildYearlyBreakdown,
  calculateMortgageScenario,
  MortgageCalculatorValues,
  MortgagePaymentRow,
  normalizeMortgageValues,
} from '../models/mortgage';

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

function formatMonths(months: number, t: TFunction): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return t('screens.tools.mortgage.term.monthsOnly', {
      count: remainingMonths,
      defaultValue: '{{count}} months',
    });
  }

  if (remainingMonths === 0) {
    return t('screens.tools.mortgage.term.yearsOnly', {
      count: years,
      defaultValue: '{{count}} years',
    });
  }

  return t('screens.tools.mortgage.term.yearsMonths', {
    years,
    months: remainingMonths,
    defaultValue: '{{years}} years {{months}} months',
  });
}

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: 'default' | 'positive';
}

function MetricCard({
  icon,
  label,
  value,
  tone = 'default',
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
            color: tone === 'positive' ? colors.support : undefined,
          }}
        >
          {value}
        </Text>
      </Stack>
    </Card>
  );
}

interface AmortizationTableProps {
  rows: MortgagePaymentRow[];
  currency: string;
}

function AmortizationTable({
  rows,
  currency,
}: Readonly<AmortizationTableProps>) {
  const { t } = useTranslation();

  return (
    <Card withBorder shadow="sm" radius="lg" p="lg">
      <Stack gap="md">
        <Text fw={600}>
          {t(
            'screens.tools.mortgage.amortization.title',
            'Monthly amortization schedule',
          )}
        </Text>

        <ScrollArea>
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  {t('screens.tools.mortgage.amortization.month', 'Month')}
                </Table.Th>
                <Table.Th>
                  {t('screens.tools.mortgage.amortization.payment', 'Payment')}
                </Table.Th>
                <Table.Th>
                  {t(
                    'screens.tools.mortgage.amortization.interest',
                    'Interest',
                  )}
                </Table.Th>
                <Table.Th>
                  {t(
                    'screens.tools.mortgage.amortization.principal',
                    'Principal',
                  )}
                </Table.Th>
                <Table.Th>
                  {t('screens.tools.mortgage.amortization.extra', 'Extra')}
                </Table.Th>
                <Table.Th>
                  {t('screens.tools.mortgage.amortization.balance', 'Balance')}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((row) => (
                <Table.Tr key={row.monthNumber}>
                  <Table.Td>{row.monthNumber}</Table.Td>
                  <Table.Td>{formatCurrency(row.totalPaid, currency)}</Table.Td>
                  <Table.Td>
                    {formatCurrency(row.interestPaid, currency)}
                  </Table.Td>
                  <Table.Td>
                    {formatCurrency(row.principalPaid, currency)}
                  </Table.Td>
                  <Table.Td>{formatCurrency(row.extraPaid, currency)}</Table.Td>
                  <Table.Td>
                    {formatCurrency(row.remainingBalance, currency)}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Stack>
    </Card>
  );
}

export function MortgageToolScreen() {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const defaultCurrency = useDefaultCurrency();
  const currencySymbol = getCurrencySymbol(defaultCurrency);
  const [values, setValues] = useState<MortgageCalculatorValues>({
    principal: 250000,
    propertyValue: 350000,
    annualInterestRate: 4.75,
    termYears: 25,
    monthlyOverpayment: 200,
    oneOffOverpayment: 0,
    oneOffOverpaymentMonth: 12,
  });

  const normalizedValues = normalizeMortgageValues(values);
  const baselineScenario = calculateMortgageScenario(normalizedValues, {
    monthlyOverpayment: 0,
    oneOffOverpayment: 0,
    oneOffOverpaymentMonth: null,
  });
  const repaymentScenario = calculateMortgageScenario(normalizedValues);
  const balanceComparison = buildBalanceComparison(
    baselineScenario,
    repaymentScenario,
    normalizedValues.principal,
  );
  const yearlyBreakdown = buildYearlyBreakdown(
    repaymentScenario.schedule,
  ).slice(0, 10);
  const hasRepaymentPlan =
    normalizedValues.monthlyOverpayment > 0 ||
    normalizedValues.oneOffOverpayment > 0;
  const interestSaved = Math.max(
    0,
    baselineScenario.summary.totalInterest -
      repaymentScenario.summary.totalInterest,
  );
  const monthsSaved = Math.max(
    0,
    baselineScenario.summary.payoffMonths -
      repaymentScenario.summary.payoffMonths,
  );
  const propertyValue = normalizedValues.propertyValue;
  const equity =
    propertyValue === null ? null : propertyValue - normalizedValues.principal;
  const loanToValue =
    propertyValue != null && propertyValue > 0
      ? (normalizedValues.principal / propertyValue) * 100
      : null;

  const handleValueChange = <K extends keyof MortgageCalculatorValues>(
    field: K,
    value: MortgageCalculatorValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  return (
    <BaseScreen
      title={t('screens.tools.mortgage.title', 'Mortgage calculator')}
    >
      <Stack p="md" gap={spacing.md}>
        <MortgageCalculatorForm
          currency={currencySymbol}
          values={values}
          onChange={handleValueChange}
        />

        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab
              value="overview"
              leftSection={<IconHomeDollar size={16} />}
            >
              {t('screens.tools.mortgage.tabs.overview', 'Overview')}
            </Tabs.Tab>
            <Tabs.Tab
              value="amortization"
              leftSection={<IconChartLine size={16} />}
            >
              {t('screens.tools.mortgage.tabs.amortization', 'Amortization')}
            </Tabs.Tab>
            <Tabs.Tab
              value="repayment"
              leftSection={<IconPigMoney size={16} />}
            >
              {t('screens.tools.mortgage.tabs.repayment', 'Repayment')}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <Stack gap={spacing.md}>
              <Grid gap="md">
                <Grid.Col span={{ base: 12, md: 6, xl: 3 }}>
                  <MetricCard
                    icon={<IconCoin size={20} />}
                    label={t(
                      'screens.tools.mortgage.metrics.monthlyPayment',
                      'Scheduled monthly payment',
                    )}
                    value={formatCurrency(
                      baselineScenario.summary.scheduledMonthlyPayment,
                      defaultCurrency,
                    )}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6, xl: 3 }}>
                  <MetricCard
                    icon={<IconClockHour4 size={20} />}
                    label={t(
                      'screens.tools.mortgage.metrics.termRemaining',
                      'Time to repay',
                    )}
                    value={formatMonths(
                      baselineScenario.summary.payoffMonths,
                      t,
                    )}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6, xl: 3 }}>
                  <MetricCard
                    icon={<IconPigMoney size={20} />}
                    label={t(
                      'screens.tools.mortgage.metrics.totalInterest',
                      'Total interest',
                    )}
                    value={formatCurrency(
                      baselineScenario.summary.totalInterest,
                      defaultCurrency,
                    )}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6, xl: 3 }}>
                  <MetricCard
                    icon={<IconHomeDollar size={20} />}
                    label={t(
                      loanToValue == null
                        ? 'screens.tools.mortgage.metrics.totalRepayable'
                        : 'screens.tools.mortgage.metrics.loanToValue',
                      loanToValue == null ? 'Total repayable' : 'Loan-to-value',
                    )}
                    value={
                      loanToValue == null
                        ? formatCurrency(
                            baselineScenario.summary.totalPaid,
                            defaultCurrency,
                          )
                        : `${loanToValue.toFixed(1)}%`
                    }
                  />
                </Grid.Col>
              </Grid>

              {equity != null && (
                <Alert
                  icon={<IconInfoCircle size={16} />}
                  radius="lg"
                  color="primary"
                >
                  <Group justify="space-between" wrap="wrap">
                    <Text>
                      {t(
                        'screens.tools.mortgage.overview.equity',
                        'Estimated equity based on the current property value.',
                      )}
                    </Text>
                    <Badge variant="light" color="primary">
                      {formatCurrency(equity, defaultCurrency)}
                    </Badge>
                  </Group>
                </Alert>
              )}

              <MortgageCharts
                balanceData={balanceComparison}
                yearlyBreakdown={yearlyBreakdown}
                currency={currencySymbol}
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="amortization" pt="md">
            <Stack gap={spacing.md}>
              <Alert
                icon={<IconInfoCircle size={16} />}
                radius="lg"
                color="primary"
              >
                <Text>
                  {t(
                    'screens.tools.mortgage.amortization.description',
                    'This schedule reflects the repayment plan, including any recurring or one-off overpayments.',
                  )}
                </Text>
              </Alert>
              <AmortizationTable
                rows={repaymentScenario.schedule}
                currency={defaultCurrency}
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="repayment" pt="md">
            <Stack gap={spacing.md}>
              <Grid gap="md">
                <Grid.Col span={{ base: 12, md: 6, xl: 3 }}>
                  <MetricCard
                    icon={<IconClockHour4 size={20} />}
                    label={t(
                      'screens.tools.mortgage.repayment.metrics.timeSaved',
                      'Time saved',
                    )}
                    value={formatMonths(monthsSaved, t)}
                    tone="positive"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6, xl: 3 }}>
                  <MetricCard
                    icon={<IconPigMoney size={20} />}
                    label={t(
                      'screens.tools.mortgage.repayment.metrics.interestSaved',
                      'Interest saved',
                    )}
                    value={formatCurrency(interestSaved, defaultCurrency)}
                    tone="positive"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6, xl: 3 }}>
                  <MetricCard
                    icon={<IconCoin size={20} />}
                    label={t(
                      'screens.tools.mortgage.repayment.metrics.paymentWithOverpay',
                      'Monthly outgoing',
                    )}
                    value={formatCurrency(
                      baselineScenario.summary.scheduledMonthlyPayment +
                        normalizedValues.monthlyOverpayment,
                      defaultCurrency,
                    )}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6, xl: 3 }}>
                  <MetricCard
                    icon={<IconChartLine size={20} />}
                    label={t(
                      'screens.tools.mortgage.repayment.metrics.payoffWithPlan',
                      'Repayment payoff term',
                    )}
                    value={formatMonths(
                      repaymentScenario.summary.payoffMonths,
                      t,
                    )}
                  />
                </Grid.Col>
              </Grid>

              <Alert
                icon={<IconInfoCircle size={16} />}
                radius="lg"
                color={hasRepaymentPlan ? 'success' : 'primary'}
              >
                <Text>
                  {hasRepaymentPlan
                    ? t(
                        'screens.tools.mortgage.repayment.summaryActive',
                        'Your repayment plan shortens the mortgage and reduces lifetime interest. Use the charts to compare the remaining balance against the base mortgage.',
                      )
                    : t(
                        'screens.tools.mortgage.repayment.summaryEmpty',
                        'Add an extra monthly payment or a one-off overpayment to see how faster repayment changes your mortgage.',
                      )}
                </Text>
              </Alert>

              <MortgageCharts
                balanceData={balanceComparison}
                yearlyBreakdown={yearlyBreakdown}
                currency={currencySymbol}
              />
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </BaseScreen>
  );
}
