import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useTheme } from '@guallet/ui-react';
import { Alert, Card, Grid, Group, Stack, Tabs, Text } from '@mantine/core';
import {
  IconCoin,
  IconInfoCircle,
  IconListDetails,
  IconPigMoney,
  IconReceipt,
} from '@tabler/icons-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SalaryBreakdownTable } from '../components/SalaryBreakdownTable';
import { SalaryForm } from '../components/SalaryForm';
import { calculateSalary, type SalaryValues } from '../models/salary';

function fmtCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 2,
  }).format(value);
}

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  sublabel?: string;
  highlight?: boolean;
}

function MetricCard({
  icon,
  label,
  value,
  sublabel,
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
        {sublabel && (
          <Text size="xs" c="dimmed">
            {sublabel}
          </Text>
        )}
      </Stack>
    </Card>
  );
}

const DEFAULT_VALUES: SalaryValues = {
  grossIncome: 35_000,
  incomeFrequency: 'annual',
  isScotland: false,
  pensionType: 'none',
  pensionMode: 'percentage',
  pensionValue: 0,
  studentLoanPlan: 'none',
};

export function SalaryCalculatorScreen() {
  const { t } = useTranslation();
  const { spacing } = useTheme();

  const [values, setValues] = useState<SalaryValues>(DEFAULT_VALUES);
  const result = calculateSalary(values);

  const handleChange = <K extends keyof SalaryValues>(
    field: K,
    value: SalaryValues[K],
  ) => setValues((prev) => ({ ...prev, [field]: value }));

  return (
    <BaseScreen title={t('screens.tools.salary.title', 'Salary calculator')}>
      <Stack p="md" gap={spacing.md}>
        <Alert icon={<IconInfoCircle size={16} />} radius="lg" color="blue">
          <Text size="sm">
            {t(
              'screens.tools.salary.disclaimer',
              'Based on 2025/26 UK tax rates. Assumes PAYE employment. This is a guide only — consult HMRC or a tax adviser for definitive figures.',
            )}
          </Text>
        </Alert>

        <SalaryForm values={values} onChange={handleChange} />

        {result.pensionTaxRelief > 0 && (
          <Alert icon={<IconPigMoney size={16} />} radius="lg" color="green">
            <Text size="sm">
              {t(
                'screens.tools.salary.reliefAtSourceNote',
                'Relief at source: HMRC will add {{amount}} basic-rate tax relief directly into your pension pot.',
                { amount: fmtCurrency(result.pensionTaxRelief) },
              )}
            </Text>
          </Alert>
        )}

        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<IconCoin size={16} />}>
              {t('screens.tools.salary.tabs.overview', 'Overview')}
            </Tabs.Tab>
            <Tabs.Tab
              value="breakdown"
              leftSection={<IconListDetails size={16} />}
            >
              {t('screens.tools.salary.tabs.breakdown', 'Tax breakdown')}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <Stack gap={spacing.md}>
              <Grid gap="md">
                <Grid.Col span={{ base: 12, sm: 6, xl: 4 }}>
                  <MetricCard
                    icon={<IconCoin size={20} />}
                    label={t(
                      'screens.tools.salary.metrics.takeHomeAnnual',
                      'Take-home (annual)',
                    )}
                    value={fmtCurrency(result.takeHomeAnnual)}
                    highlight
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, xl: 4 }}>
                  <MetricCard
                    icon={<IconCoin size={20} />}
                    label={t(
                      'screens.tools.salary.metrics.takeHomeMonthly',
                      'Take-home (monthly)',
                    )}
                    value={fmtCurrency(result.takeHomeMonthly)}
                    highlight
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, xl: 4 }}>
                  <MetricCard
                    icon={<IconCoin size={20} />}
                    label={t(
                      'screens.tools.salary.metrics.takeHomeWeekly',
                      'Take-home (weekly)',
                    )}
                    value={fmtCurrency(result.takeHomeWeekly)}
                    highlight
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, xl: 4 }}>
                  <MetricCard
                    icon={<IconReceipt size={20} />}
                    label={t(
                      'screens.tools.salary.metrics.incomeTax',
                      'Income tax',
                    )}
                    value={fmtCurrency(result.totalIncomeTax)}
                    sublabel={
                      result.grossAnnual > 0
                        ? `${((result.totalIncomeTax / result.grossAnnual) * 100).toFixed(1)}% effective rate`
                        : undefined
                    }
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, xl: 4 }}>
                  <MetricCard
                    icon={<IconReceipt size={20} />}
                    label={t(
                      'screens.tools.salary.metrics.nationalInsurance',
                      'National Insurance',
                    )}
                    value={fmtCurrency(result.totalNI)}
                  />
                </Grid.Col>
                {result.studentLoanDeduction > 0 && (
                  <Grid.Col span={{ base: 12, sm: 6, xl: 4 }}>
                    <MetricCard
                      icon={<IconReceipt size={20} />}
                      label={t(
                        'screens.tools.salary.metrics.studentLoan',
                        'Student loan',
                      )}
                      value={fmtCurrency(result.studentLoanDeduction)}
                    />
                  </Grid.Col>
                )}
                {result.pensionDeduction > 0 && (
                  <Grid.Col span={{ base: 12, sm: 6, xl: 4 }}>
                    <MetricCard
                      icon={<IconPigMoney size={20} />}
                      label={t(
                        'screens.tools.salary.metrics.pension',
                        'Pension contribution',
                      )}
                      value={fmtCurrency(result.pensionDeduction)}
                    />
                  </Grid.Col>
                )}
              </Grid>

              <SalaryBreakdownTable result={result} showTaxBands={false} />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="breakdown" pt="md">
            <SalaryBreakdownTable result={result} showTaxBands={true} />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </BaseScreen>
  );
}
