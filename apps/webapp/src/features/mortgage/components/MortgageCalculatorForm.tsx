import { Card, Grid, NumberInput, Stack, Text } from '@mantine/core';
import { useTheme } from '@guallet/ui-react';
import { useTranslation } from 'react-i18next';
import { MortgageCalculatorValues } from '../models/mortgage';

interface MortgageCalculatorFormProps {
  currency: string;
  values: MortgageCalculatorValues;
  onChange: <K extends keyof MortgageCalculatorValues>(
    field: K,
    value: MortgageCalculatorValues[K],
  ) => void;
}

export function MortgageCalculatorForm({
  currency,
  values,
  onChange,
}: Readonly<MortgageCalculatorFormProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const alignedFieldStyles = {
    root: { height: '100%' },
    description: { minHeight: spacing.xl },
  } as const;

  return (
    <Stack gap={spacing.md}>
      <Card withBorder shadow="sm" radius="lg" p="lg">
        <Stack gap={spacing.md}>
          <Text fw={600}>
            {t('screens.tools.mortgage.inputs.title', 'Mortgage details')}
          </Text>

          <Grid gap="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label={t(
                  'screens.tools.mortgage.inputs.principal',
                  'Remaining balance',
                )}
                description={t(
                  'screens.tools.mortgage.inputs.principalDescription',
                  'Current mortgage balance still outstanding.',
                )}
                value={values.principal}
                onChange={(value) => onChange('principal', Number(value) || 0)}
                min={0}
                step={1000}
                thousandSeparator=","
                decimalScale={2}
                leftSection={currency}
                styles={alignedFieldStyles}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label={t(
                  'screens.tools.mortgage.inputs.propertyValue',
                  'Property value',
                )}
                description={t(
                  'screens.tools.mortgage.inputs.propertyValueDescription',
                  'Optional. Used to estimate equity and loan-to-value.',
                )}
                value={values.propertyValue ?? ''}
                onChange={(value) =>
                  onChange(
                    'propertyValue',
                    value === '' ? null : Number(value) || 0,
                  )
                }
                min={0}
                step={1000}
                thousandSeparator=","
                decimalScale={2}
                leftSection={currency}
                styles={alignedFieldStyles}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label={t(
                  'screens.tools.mortgage.inputs.rate',
                  'Annual interest rate',
                )}
                description={t(
                  'screens.tools.mortgage.inputs.rateDescription',
                  'Fixed-rate annuity assumption for v1.',
                )}
                value={values.annualInterestRate}
                onChange={(value) =>
                  onChange('annualInterestRate', Number(value) || 0)
                }
                min={0}
                step={0.1}
                decimalScale={3}
                suffix="%"
                styles={alignedFieldStyles}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label={t(
                  'screens.tools.mortgage.inputs.term',
                  'Remaining term',
                )}
                description={t(
                  'screens.tools.mortgage.inputs.termDescription',
                  'Years left on the mortgage.',
                )}
                value={values.termYears}
                onChange={(value) => onChange('termYears', Number(value) || 1)}
                min={1}
                step={1}
                suffix={t('screens.tools.mortgage.inputs.years', ' years')}
                styles={alignedFieldStyles}
              />
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>

      <Card withBorder shadow="sm" radius="lg" p="lg">
        <Stack gap={spacing.md}>
          <Text fw={600}>
            {t('screens.tools.mortgage.repayment.title', 'Repayment strategy')}
          </Text>

          <Grid gap="md">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <NumberInput
                label={t(
                  'screens.tools.mortgage.repayment.monthlyOverpayment',
                  'Extra monthly payment',
                )}
                description={t(
                  'screens.tools.mortgage.repayment.monthlyOverpaymentDescription',
                  'Additional amount paid every month.',
                )}
                value={values.monthlyOverpayment}
                onChange={(value) =>
                  onChange('monthlyOverpayment', Number(value) || 0)
                }
                min={0}
                step={50}
                thousandSeparator=","
                decimalScale={2}
                leftSection={currency}
                styles={alignedFieldStyles}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <NumberInput
                label={t(
                  'screens.tools.mortgage.repayment.oneOffOverpayment',
                  'One-off overpayment',
                )}
                description={t(
                  'screens.tools.mortgage.repayment.oneOffOverpaymentDescription',
                  'Optional lump sum applied once.',
                )}
                value={values.oneOffOverpayment}
                onChange={(value) =>
                  onChange('oneOffOverpayment', Number(value) || 0)
                }
                min={0}
                step={500}
                thousandSeparator=","
                decimalScale={2}
                leftSection={currency}
                styles={alignedFieldStyles}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <NumberInput
                label={t(
                  'screens.tools.mortgage.repayment.oneOffMonth',
                  'One-off payment month',
                )}
                description={t(
                  'screens.tools.mortgage.repayment.oneOffMonthDescription',
                  'Month number from today for the lump sum.',
                )}
                value={values.oneOffOverpaymentMonth ?? ''}
                onChange={(value) =>
                  onChange(
                    'oneOffOverpaymentMonth',
                    value === '' ? null : Number(value) || 1,
                  )
                }
                min={1}
                step={1}
                styles={alignedFieldStyles}
              />
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>
    </Stack>
  );
}
