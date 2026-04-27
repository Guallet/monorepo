import { useTheme } from '@guallet/ui-react';
import { Card, NumberInput, SegmentedControl, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { BuyerType, StampDutyValues } from '../models/stampDuty';

interface StampDutyFormProps {
  values: StampDutyValues;
  onChange: <K extends keyof StampDutyValues>(
    field: K,
    value: StampDutyValues[K],
  ) => void;
}

export function StampDutyForm({
  values,
  onChange,
}: Readonly<StampDutyFormProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();

  const buyerTypeOptions = [
    {
      value: 'standard',
      label: t('screens.tools.stampDuty.form.buyerType.standard', 'Standard'),
    },
    {
      value: 'firstTimeBuyer',
      label: t(
        'screens.tools.stampDuty.form.buyerType.firstTimeBuyer',
        'First-time buyer',
      ),
    },
    {
      value: 'additionalProperty',
      label: t(
        'screens.tools.stampDuty.form.buyerType.additionalProperty',
        'Additional property',
      ),
    },
  ];

  return (
    <Card withBorder shadow="sm" radius="lg" p="lg">
      <Stack gap={spacing.md}>
        <NumberInput
          label={t(
            'screens.tools.stampDuty.form.propertyPrice',
            'Property price',
          )}
          value={values.propertyPrice}
          onChange={(v) => onChange('propertyPrice', Number(v) || 0)}
          min={0}
          step={10_000}
          thousandSeparator=","
          prefix="£"
          decimalScale={0}
          size="md"
        />

        <Stack gap={spacing.xs}>
          <Text size="sm" fw={500}>
            {t('screens.tools.stampDuty.form.buyerTypeLabel', 'Buyer type')}
          </Text>
          <SegmentedControl
            value={values.buyerType}
            onChange={(v) => onChange('buyerType', v as BuyerType)}
            data={buyerTypeOptions}
            fullWidth
          />
        </Stack>
      </Stack>
    </Card>
  );
}
