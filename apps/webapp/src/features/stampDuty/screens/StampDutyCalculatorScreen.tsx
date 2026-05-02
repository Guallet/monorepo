import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useTheme } from '@guallet/ui-react';
import { Alert, Badge, Card, Grid, Group, Stack, Text } from '@mantine/core';
import {
  IconAlertCircle,
  IconCoin,
  IconInfoCircle,
  IconPercentage,
} from '@tabler/icons-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StampDutyBandTable } from '../components/StampDutyBandTable';
import { StampDutyForm } from '../components/StampDutyForm';
import { calculateStampDuty, type StampDutyValues } from '../models/stampDuty';

const CURRENCY = 'GBP';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 2,
  }).format(amount);
}

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function MetricCard({ icon, label, value }: Readonly<MetricCardProps>) {
  const { spacing } = useTheme();

  return (
    <Card withBorder shadow="sm" radius="lg" p="lg">
      <Stack gap={spacing.xs}>
        <Group justify="space-between" wrap="nowrap">
          <Text size="sm" c="dimmed">
            {label}
          </Text>
          {icon}
        </Group>
        <Text fw={700} size="xl" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </Text>
      </Stack>
    </Card>
  );
}

export function StampDutyCalculatorScreen() {
  const { t } = useTranslation();
  const { spacing } = useTheme();

  const [values, setValues] = useState<StampDutyValues>({
    propertyPrice: 350_000,
    buyerType: 'standard',
  });

  const result = calculateStampDuty(values);

  const handleChange = <K extends keyof StampDutyValues>(
    field: K,
    value: StampDutyValues[K],
  ) => setValues((prev) => ({ ...prev, [field]: value }));

  return (
    <BaseScreen
      title={t('screens.tools.stampDuty.title', 'Stamp Duty calculator')}
    >
      <Stack p="md" gap={spacing.md}>
        <Alert icon={<IconInfoCircle size={16} />} radius="lg" color="blue">
          <Text size="sm">
            {t(
              'screens.tools.stampDuty.disclaimer',
              'Rates apply to England and Northern Ireland only. Based on April 2025 stamp duty land tax (SDLT) bands.',
            )}
          </Text>
        </Alert>

        <StampDutyForm values={values} onChange={handleChange} />

        {result.ftbReliefApplied && (
          <Alert icon={<IconInfoCircle size={16} />} radius="lg" color="green">
            <Group justify="space-between" wrap="wrap">
              <Text size="sm">
                {t(
                  'screens.tools.stampDuty.ftbRelief',
                  'First-time buyer relief applied — nil-rate band extended to £300,000.',
                )}
              </Text>
              <Badge color="green" variant="light">
                {t('screens.tools.stampDuty.ftbReliefBadge', 'FTB relief')}
              </Badge>
            </Group>
          </Alert>
        )}

        {result.ftbReliefUnavailable && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            radius="lg"
            color="orange"
          >
            <Text size="sm">
              {t(
                'screens.tools.stampDuty.ftbReliefUnavailable',
                'Property price exceeds £500,000 — first-time buyer relief is not available. Standard rates apply.',
              )}
            </Text>
          </Alert>
        )}

        <Grid gap="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <MetricCard
              icon={<IconCoin size={20} />}
              label={t(
                'screens.tools.stampDuty.metrics.totalDue',
                'Stamp duty due',
              )}
              value={formatCurrency(result.totalDue)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <MetricCard
              icon={<IconPercentage size={20} />}
              label={t(
                'screens.tools.stampDuty.metrics.effectiveRate',
                'Effective rate',
              )}
              value={`${result.effectiveRate}%`}
            />
          </Grid.Col>
        </Grid>

        <StampDutyBandTable result={result} currency={CURRENCY} />
      </Stack>
    </BaseScreen>
  );
}
