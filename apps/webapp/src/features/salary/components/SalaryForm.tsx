import { useTheme } from '@guallet/ui-react';
import {
  Card,
  NumberInput,
  Select,
  SegmentedControl,
  Stack,
  Switch,
  Text,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type {
  IncomeFrequency,
  PensionMode,
  PensionType,
  SalaryValues,
  StudentLoanPlan,
} from '../models/salary';

interface SalaryFormProps {
  values: SalaryValues;
  onChange: <K extends keyof SalaryValues>(
    field: K,
    value: SalaryValues[K],
  ) => void;
}

export function SalaryForm({ values, onChange }: Readonly<SalaryFormProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();

  const frequencyOptions: { value: IncomeFrequency; label: string }[] = [
    {
      value: 'annual',
      label: t('screens.tools.salary.form.frequency.annual', 'Annual'),
    },
    {
      value: 'monthly',
      label: t('screens.tools.salary.form.frequency.monthly', 'Monthly'),
    },
    {
      value: 'weekly',
      label: t('screens.tools.salary.form.frequency.weekly', 'Weekly'),
    },
  ];

  const pensionTypeOptions = [
    {
      value: 'none',
      label: t('screens.tools.salary.form.pension.none', 'None'),
    },
    {
      value: 'salaryScrifice',
      label: t(
        'screens.tools.salary.form.pension.salaryScrifice',
        'Salary sacrifice',
      ),
    },
    {
      value: 'reliefAtSource',
      label: t(
        'screens.tools.salary.form.pension.reliefAtSource',
        'Relief at source',
      ),
    },
  ];

  const pensionModeOptions: { value: PensionMode; label: string }[] = [
    {
      value: 'percentage',
      label: t('screens.tools.salary.form.pension.modePercent', '%'),
    },
    {
      value: 'fixed',
      label: t('screens.tools.salary.form.pension.modeFixed', '£ / year'),
    },
  ];

  const studentLoanOptions = [
    {
      value: 'none',
      label: t('screens.tools.salary.form.studentLoan.none', 'None'),
    },
    {
      value: 'plan1',
      label: t(
        'screens.tools.salary.form.studentLoan.plan1',
        'Plan 1 (pre-2012)',
      ),
    },
    {
      value: 'plan2',
      label: t(
        'screens.tools.salary.form.studentLoan.plan2',
        'Plan 2 (post-2012 England/Wales)',
      ),
    },
    {
      value: 'plan4',
      label: t(
        'screens.tools.salary.form.studentLoan.plan4',
        'Plan 4 (Scotland)',
      ),
    },
    {
      value: 'plan5',
      label: t(
        'screens.tools.salary.form.studentLoan.plan5',
        'Plan 5 (from 2023)',
      ),
    },
    {
      value: 'postgrad',
      label: t(
        'screens.tools.salary.form.studentLoan.postgrad',
        'Postgraduate loan',
      ),
    },
  ];

  const hasPension = values.pensionType !== 'none';

  return (
    <Card withBorder shadow="sm" radius="lg" p="lg">
      <Stack gap={spacing.md}>
        {/* Income */}
        <Stack gap={spacing.xs}>
          <Text size="sm" fw={500}>
            {t('screens.tools.salary.form.incomeLabel', 'Gross income')}
          </Text>
          <NumberInput
            value={values.grossIncome}
            onChange={(v) => onChange('grossIncome', Number(v) || 0)}
            min={0}
            step={1_000}
            thousandSeparator=","
            prefix="£"
            decimalScale={0}
            size="md"
          />
          <SegmentedControl
            value={values.incomeFrequency}
            onChange={(v) => onChange('incomeFrequency', v as IncomeFrequency)}
            data={frequencyOptions}
            fullWidth
          />
        </Stack>

        {/* Scotland toggle */}
        <Switch
          label={t(
            'screens.tools.salary.form.scotland',
            'I pay Scottish income tax',
          )}
          checked={values.isScotland}
          onChange={(e) => onChange('isScotland', e.currentTarget.checked)}
        />

        {/* Pension */}
        <Stack gap={spacing.xs}>
          <Select
            label={t(
              'screens.tools.salary.form.pension.typeLabel',
              'Pension contribution',
            )}
            value={values.pensionType}
            onChange={(v) =>
              onChange('pensionType', (v ?? 'none') as PensionType)
            }
            data={pensionTypeOptions}
          />
          {hasPension && (
            <Stack gap={spacing.xs}>
              <SegmentedControl
                value={values.pensionMode}
                onChange={(v) => onChange('pensionMode', v as PensionMode)}
                data={pensionModeOptions}
                fullWidth
              />
              <NumberInput
                value={values.pensionValue}
                onChange={(v) => onChange('pensionValue', Number(v) || 0)}
                min={0}
                max={values.pensionMode === 'percentage' ? 100 : undefined}
                step={values.pensionMode === 'percentage' ? 1 : 500}
                decimalScale={values.pensionMode === 'percentage' ? 1 : 0}
                suffix={values.pensionMode === 'percentage' ? '%' : undefined}
                prefix={values.pensionMode === 'fixed' ? '£' : undefined}
                thousandSeparator={
                  values.pensionMode === 'fixed' ? ',' : undefined
                }
                placeholder={
                  values.pensionMode === 'percentage'
                    ? t(
                        'screens.tools.salary.form.pension.placeholderPercent',
                        'e.g. 5',
                      )
                    : t(
                        'screens.tools.salary.form.pension.placeholderFixed',
                        'e.g. 3000',
                      )
                }
              />
            </Stack>
          )}
        </Stack>

        {/* Student loan */}
        <Select
          label={t(
            'screens.tools.salary.form.studentLoan.label',
            'Student loan repayment',
          )}
          value={values.studentLoanPlan}
          onChange={(v) =>
            onChange('studentLoanPlan', (v ?? 'none') as StudentLoanPlan)
          }
          data={studentLoanOptions}
        />
      </Stack>
    </Card>
  );
}
