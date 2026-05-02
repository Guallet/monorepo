import { CurrencyPicker } from '@/components/CurrencyPicker/CurrencyPicker';
import { AccountTypeDto } from '@guallet/api-client';
import { useTheme } from '@guallet/ui-react';
import {
  Button,
  Checkbox,
  Divider,
  NumberInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Currency } from '@guallet/money';
import { useTranslation } from 'react-i18next';
import { getAccountTypeTitleSingular } from '../../models/Account';
import {
  AddAccountFormData,
  hasSpecificStep,
} from '../../screens/addAccountFormSchema';
import { BackButton } from './BackButton';
import { InstitutionPicker } from './InstitutionPicker';
import { WizardProgress } from './WizardProgress';

function getNumberParser(value: string): number {
  return value ? Number.parseFloat(value) : 0;
}

function getNullableNumberParser(value: string): number | null {
  return value ? Number.parseFloat(value) : null;
}

interface StepManualDetailsProps {
  form: UseFormReturnType<AddAccountFormData>;
  onNext: () => void;
  onBack: () => void;
}

export function StepManualDetails({
  form,
  onNext,
  onBack,
}: Readonly<StepManualDetailsProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();

  const currencyValue = form.values.currency;
  const currency = currencyValue ? Currency.fromISOCode(currencyValue) : null;
  const typeMeta = getAccountTypeTitleSingular(form.values.account_type);
  const hasSpecificFields = hasSpecificStep(form.values.account_type);

  function handleNext() {
    const result = form.validate();
    if (result.hasErrors) {
      notifications.show({
        title: t(
          'feature.accounts.add.errors.validation.title',
          'Check your entries',
        ),
        message: t(
          'feature.accounts.add.errors.validation.message',
          'Please correct the highlighted fields before continuing.',
        ),
        color: 'red',
      });
    } else {
      onNext();
    }
  }

  function renderSpecificFields() {
    switch (form.values.account_type) {
      case AccountTypeDto.CURRENT_ACCOUNT:
        return (
          <>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={spacing.md}>
              <TextInput
                label={t(
                  'feature.accounts.add.fields.accountNumber.label',
                  'Account number',
                )}
                placeholder={t(
                  'feature.accounts.add.fields.accountNumber.placeholder',
                  'Enter account number',
                )}
                {...form.getInputProps('currentAccountNumber')}
              />
              <TextInput
                label={t(
                  'feature.accounts.add.fields.sortCode.label',
                  'Sort code',
                )}
                placeholder="00-00-00"
                {...form.getInputProps('currentSortCode')}
              />
            </SimpleGrid>
            <NumberInput
              label={t(
                'feature.accounts.add.fields.overdraftLimit.label',
                'Overdraft limit',
              )}
              description={t('common.optional', 'Optional')}
              leftSection={currency?.symbol}
              decimalScale={currency?.decimalPlaces}
              {...form.getInputProps('currentOverdraftLimit', {
                parser: getNullableNumberParser,
              })}
            />
          </>
        );
      case AccountTypeDto.CREDIT_CARD:
        return (
          <>
            <TextInput
              label={t(
                'feature.accounts.add.fields.accountNumber.label',
                'Account number',
              )}
              placeholder={t(
                'feature.accounts.add.fields.accountNumber.placeholder',
                'Enter account number',
              )}
              {...form.getInputProps('creditCardAccountNumber')}
            />
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={spacing.md}>
              <NumberInput
                label={t(
                  'feature.accounts.add.fields.interestRate.label',
                  'Interest rate',
                )}
                leftSection="%"
                decimalScale={2}
                {...form.getInputProps('creditCardInterestRate', {
                  parser: getNullableNumberParser,
                })}
              />
              <NumberInput
                label={t(
                  'feature.accounts.add.fields.creditLimit.label',
                  'Credit limit',
                )}
                leftSection={currency?.symbol}
                decimalScale={currency?.decimalPlaces}
                {...form.getInputProps('creditCardCreditLimit', {
                  parser: getNullableNumberParser,
                })}
              />
            </SimpleGrid>
            <NumberInput
              label={t(
                'feature.accounts.add.fields.cycleDay.label',
                'Cycle day',
              )}
              min={1}
              max={31}
              {...form.getInputProps('creditCardCycleDay', {
                parser: getNullableNumberParser,
              })}
            />
          </>
        );
      case AccountTypeDto.SAVINGS:
        return (
          <NumberInput
            label={t(
              'feature.accounts.add.fields.interestRate.label',
              'Interest rate',
            )}
            leftSection="%"
            decimalScale={2}
            {...form.getInputProps('savingsInterestRate', {
              parser: getNullableNumberParser,
            })}
          />
        );
      case AccountTypeDto.MORTGAGE:
        return (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={spacing.md}>
            <NumberInput
              label={t(
                'feature.accounts.add.fields.propertyValue.label',
                'Property value',
              )}
              leftSection={currency?.symbol}
              decimalScale={currency?.decimalPlaces}
              {...form.getInputProps('mortgagePropertyValue', {
                parser: getNullableNumberParser,
              })}
            />
            <NumberInput
              label={t(
                'feature.accounts.add.fields.mortgageAmount.label',
                'Mortgage amount',
              )}
              leftSection={currency?.symbol}
              decimalScale={currency?.decimalPlaces}
              {...form.getInputProps('mortgageAmount', {
                parser: getNullableNumberParser,
              })}
            />
            <NumberInput
              label={t(
                'feature.accounts.add.fields.interestRate.label',
                'Interest rate',
              )}
              leftSection="%"
              decimalScale={2}
              {...form.getInputProps('mortgageInterestRate', {
                parser: getNullableNumberParser,
              })}
            />
            <NumberInput
              label={t(
                'feature.accounts.add.fields.termLength.label',
                'Term length',
              )}
              description={t(
                'feature.accounts.add.fields.termLength.description',
                'Years',
              )}
              {...form.getInputProps('mortgageTermLength', {
                parser: getNullableNumberParser,
              })}
            />
          </SimpleGrid>
        );
      case AccountTypeDto.LOAN:
        return (
          <>
            <NumberInput
              label={t(
                'feature.accounts.add.fields.loanAmount.label',
                'Loan amount',
              )}
              leftSection={currency?.symbol}
              decimalScale={currency?.decimalPlaces}
              {...form.getInputProps('loanAmount', {
                parser: getNullableNumberParser,
              })}
            />
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={spacing.md}>
              <NumberInput
                label={t(
                  'feature.accounts.add.fields.interestRate.label',
                  'Interest rate',
                )}
                leftSection="%"
                decimalScale={2}
                {...form.getInputProps('loanInterestRate', {
                  parser: getNullableNumberParser,
                })}
              />
              <NumberInput
                label={t(
                  'feature.accounts.add.fields.termLength.label',
                  'Term length',
                )}
                description={t(
                  'feature.accounts.add.fields.termLength.description',
                  'Years',
                )}
                {...form.getInputProps('loanTermLength', {
                  parser: getNullableNumberParser,
                })}
              />
            </SimpleGrid>
          </>
        );
      default:
        return null;
    }
  }

  return (
    <Stack>
      <BackButton onClick={onBack} />
      <WizardProgress
        steps={[
          t('feature.accounts.add.steps.type', 'Type'),
          t('feature.accounts.add.steps.details', 'Details'),
          t('feature.accounts.add.steps.done', 'Done'),
        ]}
        current={1}
      />

      <Title order={4} mb={4}>
        {t('feature.accounts.add.detailsStep.title', 'Account details')}
      </Title>
      <Text size="sm" c="dimmed" mb="md">
        {t(
          'feature.accounts.add.detailsStep.subtitle',
          'Setting up a {{type}}',
          {
            type: typeMeta.toLowerCase(),
          },
        )}
      </Text>

      <Stack gap={spacing.md}>
        <TextInput
          required
          label={t('feature.accounts.add.fields.name.label', 'Account name')}
          placeholder={t(
            'feature.accounts.add.fields.name.placeholder',
            'e.g. HSBC Current Account',
          )}
          {...form.getInputProps('name')}
        />

        <Stack gap={spacing.xs}>
          <Text size="sm" fw={600}>
            {t('feature.accounts.add.fields.institution.label', 'Institution')}{' '}
            <Text component="span" size="sm" c="dimmed" fw={400}>
              {t('common.optional', '(optional)')}
            </Text>
          </Text>
          <InstitutionPicker
            value={form.values.institution_id ?? null}
            onChange={(id) => form.setFieldValue('institution_id', id)}
          />
        </Stack>

        <CurrencyPicker
          name="currency"
          required
          value={form.values.currency}
          onValueChanged={(v) => form.setFieldValue('currency', v)}
        />

        <NumberInput
          required
          label={t(
            'feature.accounts.add.fields.balance.label',
            'Starting balance',
          )}
          description={t(
            'feature.accounts.add.fields.balance.description',
            'Current balance of the account',
          )}
          leftSection={currency?.symbol}
          decimalScale={currency?.decimalPlaces}
          {...form.getInputProps('balance', { parser: getNumberParser })}
        />

        <Checkbox
          label={t(
            'feature.accounts.add.fields.createInitialTransaction.label',
            'Create an opening balance transaction',
          )}
          description={t(
            'feature.accounts.add.fields.createInitialTransaction.description',
            'Records the initial balance as the first transaction',
          )}
          {...form.getInputProps('createInitialTransaction', {
            type: 'checkbox',
          })}
        />
      </Stack>

      {hasSpecificFields && (
        <>
          <Divider
            mt="md"
            label={
              <Text
                size="xs"
                fw={600}
                tt="uppercase"
                c="dimmed"
                style={{ letterSpacing: '0.06em' }}
              >
                {t(
                  'feature.accounts.add.specificDetails.title',
                  'Account details',
                )}
              </Text>
            }
          />
          <Stack gap={spacing.md}>{renderSpecificFields()}</Stack>
        </>
      )}

      <Button fullWidth mt="md" onClick={handleNext}>
        {t('feature.accounts.add.submitButton', 'Save account')}
      </Button>
    </Stack>
  );
}
