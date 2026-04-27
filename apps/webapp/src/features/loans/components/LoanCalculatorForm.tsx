import { useTheme } from '@guallet/ui-react';
import { Card, NumberInput, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { LoanCalculatorValues } from '../models/loan';

interface LoanCalculatorFormProps {
  currency: string;
  values: LoanCalculatorValues;
  onChange: <K extends keyof LoanCalculatorValues>(
    field: K,
    value: LoanCalculatorValues[K],
  ) => void;
  label?: string;
}

export function LoanCalculatorForm({
  currency,
  values,
  onChange,
  label,
}: Readonly<LoanCalculatorFormProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();

  return (
    <Card withBorder shadow="sm" radius="lg" p="lg">
      {label && (
        <Text fw={600} mb={spacing.sm}>
          {label}
        </Text>
      )}
      <Stack gap={spacing.sm}>
        <NumberInput
          label={t('screens.tools.loan.form.amount', 'Loan amount')}
          value={values.amount}
          onChange={(v) => onChange('amount', Number(v) || 0)}
          min={0}
          step={1000}
          thousandSeparator=","
          prefix={currency}
          decimalScale={2}
        />

        <NumberInput
          label={t(
            'screens.tools.loan.form.interestRate',
            'Annual interest rate',
          )}
          value={values.annualInterestRate}
          onChange={(v) => onChange('annualInterestRate', Number(v) || 0)}
          min={0}
          max={100}
          step={0.1}
          decimalScale={2}
          suffix="%"
        />

        <NumberInput
          label={t('screens.tools.loan.form.termMonths', 'Term (months)')}
          value={values.termMonths}
          onChange={(v) => onChange('termMonths', Math.max(1, Number(v) || 1))}
          min={1}
          max={600}
          step={12}
          decimalScale={0}
        />

        <NumberInput
          label={t(
            'screens.tools.loan.form.arrangementFee',
            'Arrangement fee',
          )}
          description={t(
            'screens.tools.loan.form.arrangementFeeDescription',
            'One-off upfront fee',
          )}
          value={values.arrangementFee}
          onChange={(v) => onChange('arrangementFee', Number(v) || 0)}
          min={0}
          step={50}
          thousandSeparator=","
          prefix={currency}
          decimalScale={2}
        />
      </Stack>
    </Card>
  );
}
