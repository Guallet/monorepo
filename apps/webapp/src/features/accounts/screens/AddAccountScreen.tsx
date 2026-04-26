import { CurrencyPicker } from '@/components/CurrencyPicker/CurrencyPicker';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { AccountTypeDto, CreateAccountRequest } from '@guallet/api-client';
import { useAccountMutations } from '@guallet/api-react';
import { Currency } from '@guallet/money';
import { useTheme } from '@guallet/ui-react';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate } from '@tanstack/react-router';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useTranslation } from 'react-i18next';
import { getAccountTypeTitleSingular } from '../models/Account';
import {
  accountFormDataSchema,
  AddAccountFormData,
  getAccountProperties,
  hasSpecificStep,
} from './addAccountFormSchema';

function getNumberParser(value: string): number {
  return value ? Number.parseFloat(value) : 0;
}

function getNullableNumberParser(value: string): number | null {
  return value ? Number.parseFloat(value) : null;
}

export function AddAccountScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { spacing } = useTheme();
  const { createAccountMutation } = useAccountMutations();
  const defaultCurrency = useDefaultCurrency();

  const form = useForm<AddAccountFormData>({
    validate: zod4Resolver(accountFormDataSchema),
    initialValues: {
      name: '',
      account_type: AccountTypeDto.CURRENT_ACCOUNT,
      currency: defaultCurrency,
      balance: 0,
      createInitialTransaction: true,
      currentAccountNumber: '',
      currentSortCode: '',
      currentOverdraftLimit: null,
      creditCardAccountNumber: '',
      creditCardInterestRate: null,
      creditCardCreditLimit: null,
      creditCardCycleDay: null,
      savingsInterestRate: null,
      mortgagePropertyValue: null,
      mortgageAmount: null,
      mortgageInterestRate: null,
      mortgageTermLength: null,
      loanAmount: null,
      loanInterestRate: null,
      loanTermLength: null,
    },
  });

  const { values } = form;
  const currencyValue = values.currency;
  const currency = currencyValue ? Currency.fromISOCode(currencyValue) : null;

  const accountTypes = Object.values(AccountTypeDto).map((type) => ({
    label: getAccountTypeTitleSingular(type),
    value: type,
  }));

  const hasSpecificFields = hasSpecificStep(values.account_type);

  async function onFormSubmit(data: AddAccountFormData): Promise<void> {
    if (data.currency === null) {
      notifications.show({
        title: t(
          'feature.accounts.add.errors.currencyRequired.title',
          'Currency required',
        ),
        message: t(
          'feature.accounts.add.errors.currencyRequired.message',
          'Please select a currency for the account.',
        ),
        color: 'red',
      });
      return;
    }

    const accountRequest: CreateAccountRequest = {
      name: data.name,
      type: data.account_type,
      currency: data.currency,
      initial_balance: data.balance,
      create_balance_transaction: data.createInitialTransaction,
      properties: getAccountProperties(data),
    };

    try {
      const newAccount = await createAccountMutation.mutateAsync({
        request: accountRequest,
      });
      notifications.show({
        message: t(
          'feature.accounts.add.notifications.success',
          '{{name}} created successfully.',
          { name: newAccount.name },
        ),
        color: 'green',
      });
      navigate({ to: '/accounts/$id', params: { id: newAccount.id } });
    } catch (error) {
      console.error('Error creating the account', error);
      notifications.show({
        title: t(
          'feature.accounts.add.notifications.error.title',
          'Could not create account',
        ),
        message: t(
          'feature.accounts.add.notifications.error.message',
          'A network or server error occurred. Please try again.',
        ),
        color: 'red',
      });
    }
  }

  function renderSpecificFields() {
    switch (values.account_type) {
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
          <>
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
          </>
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
    <BaseScreen title={t('feature.accounts.add.title', 'New account')}>
      {/* Constrain width on desktop; full-width on mobile */}
      <Box maw={560} mx="auto">
        <form
          onSubmit={form.onSubmit(onFormSubmit, () => {
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
          })}
        >
          <Stack gap={spacing.md}>
            {/* Core account details */}
            <Card
              withBorder
              shadow="sm"
              radius="lg"
              padding={{ base: 'md', sm: 'lg' }}
            >
              <Stack gap={spacing.md}>
                <TextInput
                  required
                  label={t(
                    'feature.accounts.add.fields.name.label',
                    'Account name',
                  )}
                  placeholder={t(
                    'feature.accounts.add.fields.name.placeholder',
                    'e.g. HSBC Current Account',
                  )}
                  {...form.getInputProps('name')}
                />
                <Select
                  required
                  label={t(
                    'feature.accounts.add.fields.type.label',
                    'Account type',
                  )}
                  searchable
                  data={accountTypes}
                  {...form.getInputProps('account_type')}
                  onChange={(value) => {
                    if (!value) return;
                    form.setFieldValue('account_type', value as AccountTypeDto);
                  }}
                />
                <CurrencyPicker
                  name="currency"
                  required
                  value={values.currency}
                  onValueChanged={(newValue) => {
                    form.setFieldValue('currency', newValue);
                  }}
                />
                <NumberInput
                  required
                  label={t(
                    'feature.accounts.add.fields.balance.label',
                    'Initial balance',
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
            </Card>

            {/* Type-specific fields */}
            {hasSpecificFields && (
              <Card
                withBorder
                shadow="sm"
                radius="lg"
                padding={{ base: 'md', sm: 'lg' }}
              >
                <Stack gap={spacing.md}>
                  <Text fw={600} size="sm">
                    {t(
                      'feature.accounts.add.specificDetails.title',
                      'Account details',
                    )}
                  </Text>
                  <Divider />
                  {renderSpecificFields()}
                </Stack>
              </Card>
            )}

            {/* Actions — stacked full-width on mobile, row on sm+ */}
            <Stack gap="xs" hiddenFrom="sm">
              <Button
                type="submit"
                fullWidth
                size="md"
                loading={createAccountMutation.isPending}
              >
                {t('feature.accounts.add.submitButton', 'Create account')}
              </Button>
              <Button
                variant="outline"
                fullWidth
                size="md"
                onClick={() => navigate({ to: '/accounts' })}
              >
                {t('feature.accounts.add.cancelButton', 'Cancel')}
              </Button>
            </Stack>
            <Group justify="flex-end" gap="xs" visibleFrom="sm">
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/accounts' })}
              >
                {t('feature.accounts.add.cancelButton', 'Cancel')}
              </Button>
              <Button
                type="submit"
                loading={createAccountMutation.isPending}
              >
                {t('feature.accounts.add.submitButton', 'Create account')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Box>
    </BaseScreen>
  );
}
