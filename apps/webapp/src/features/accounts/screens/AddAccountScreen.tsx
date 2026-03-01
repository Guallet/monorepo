import { AppSection } from '@/components/Cards/AppSection';
import { CurrencyPicker } from '@/components/CurrencyPicker/CurrencyPicker';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { AccountTypeDto, CreateAccountRequest } from '@guallet/api-client';
import { useAccountMutations } from '@guallet/api-react';
import { Currency } from '@guallet/money';
import {
  Button,
  Group,
  Select,
  NumberInput,
  Stack,
  TextInput,
  Checkbox,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate } from '@tanstack/react-router';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { getAccountTypeTitleSingular } from '../models/Account';
import {
  accountFormDataSchema,
  AddAccountFormData,
  getAccountProperties,
  hasSpecificStep,
} from './addAccountFormSchema';

/** Used for required numeric fields — empty string becomes 0. */
function getNumberParser(value: string): number {
  return value ? Number.parseFloat(value) : 0;
}

/** Used for optional/nullable numeric fields — empty string becomes null. */
function getNullableNumberParser(value: string): number | null {
  return value ? Number.parseFloat(value) : null;
}

export function AddAccountScreen() {
  const navigate = useNavigate();
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

  const accountTypes = Object.values(AccountTypeDto).map((accountType) => ({
    label: getAccountTypeTitleSingular(accountType),
    value: accountType,
  }));

  const hasSpecificFields = hasSpecificStep(values.account_type);

  async function onFormSubmit(data: AddAccountFormData): Promise<void> {
    if (data.currency === null) {
      notifications.show({
        title: 'Currency is required',
        message: 'Please select a currency for the account',
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
        title: 'Account created',
        message: `Account ${newAccount.name} created`,
        color: 'blue',
      });
      navigate({
        to: '/accounts/$id',
        params: {
          id: newAccount.id,
        },
      });
    } catch (error) {
      console.error('Error creating the account', error);
      notifications.show({
        title: 'Unable to create account',
        message:
          'A network or server error occurred while creating the account. Please try again later.',
        color: 'red',
      });
    }
  }

  const renderSpecificFields = () => {
    switch (values.account_type) {
      case AccountTypeDto.CURRENT_ACCOUNT:
        return (
          <Stack>
            <TextInput
              label="Account number"
              placeholder="Enter account number"
              {...form.getInputProps('currentAccountNumber')}
            />
            <TextInput
              label="Sort code"
              placeholder="00-00-00"
              {...form.getInputProps('currentSortCode')}
            />
            <NumberInput
              label="Overdraft limit"
              description="Optional"
              leftSection={currency?.symbol}
              decimalScale={currency?.decimalPlaces}
              {...form.getInputProps('currentOverdraftLimit', {
                parser: getNullableNumberParser,
              })}
            />
          </Stack>
        );
      case AccountTypeDto.CREDIT_CARD:
        return (
          <Stack>
            <TextInput
              label="Account number"
              placeholder="Enter account number"
              {...form.getInputProps('creditCardAccountNumber')}
            />
            <NumberInput
              label="Interest rate"
              leftSection="%"
              decimalScale={2}
              {...form.getInputProps('creditCardInterestRate', {
                parser: getNullableNumberParser,
              })}
            />
            <NumberInput
              label="Credit limit"
              leftSection={currency?.symbol}
              decimalScale={currency?.decimalPlaces}
              {...form.getInputProps('creditCardCreditLimit', {
                parser: getNullableNumberParser,
              })}
            />
            <NumberInput
              label="Cycle day"
              min={1}
              max={31}
              {...form.getInputProps('creditCardCycleDay', {
                parser: getNullableNumberParser,
              })}
            />
          </Stack>
        );
      case AccountTypeDto.SAVINGS:
        return (
          <Stack>
            <NumberInput
              label="Interest rate"
              leftSection="%"
              decimalScale={2}
              {...form.getInputProps('savingsInterestRate', {
                parser: getNullableNumberParser,
              })}
            />
          </Stack>
        );
      case AccountTypeDto.MORTGAGE:
        return (
          <Stack>
            <NumberInput
              label="Property value"
              leftSection={currency?.symbol}
              decimalScale={currency?.decimalPlaces}
              {...form.getInputProps('mortgagePropertyValue', {
                parser: getNullableNumberParser,
              })}
            />
            <NumberInput
              label="Mortgage amount"
              leftSection={currency?.symbol}
              decimalScale={currency?.decimalPlaces}
              {...form.getInputProps('mortgageAmount', {
                parser: getNullableNumberParser,
              })}
            />
            <NumberInput
              label="Interest rate"
              leftSection="%"
              decimalScale={2}
              {...form.getInputProps('mortgageInterestRate', {
                parser: getNullableNumberParser,
              })}
            />
            <NumberInput
              label="Term length"
              description="Years"
              {...form.getInputProps('mortgageTermLength', {
                parser: getNullableNumberParser,
              })}
            />
          </Stack>
        );
      case AccountTypeDto.LOAN:
        return (
          <Stack>
            <NumberInput
              label="Loan amount"
              leftSection={currency?.symbol}
              decimalScale={currency?.decimalPlaces}
              {...form.getInputProps('loanAmount', {
                parser: getNullableNumberParser,
              })}
            />
            <NumberInput
              label="Interest rate"
              leftSection="%"
              decimalScale={2}
              {...form.getInputProps('loanInterestRate', {
                parser: getNullableNumberParser,
              })}
            />
            <NumberInput
              label="Term length"
              description="Years"
              {...form.getInputProps('loanTermLength', {
                parser: getNullableNumberParser,
              })}
            />
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <BaseScreen>
      <form
        onSubmit={form.onSubmit(onFormSubmit, () => {
          notifications.show({
            title: 'Validation error',
            message: 'Please correct the highlighted fields before submitting.',
            color: 'red',
          });
        })}
      >
        <Stack>
          <AppSection title="Create new account">
            <Stack>
              <TextInput
                required
                label="Account name"
                placeholder="Enter account name"
                {...form.getInputProps('name')}
              />
              <Select
                required
                label="Account type"
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
                label="Initial balance"
                required
                description="Initial balance of the account"
                leftSection={currency?.symbol}
                decimalScale={currency?.decimalPlaces}
                {...form.getInputProps('balance', {
                  parser: getNumberParser,
                })}
              />
              <Checkbox
                label="Create initial balance transaction"
                description="If checked, an initial transaction will be created to reflect the starting balance"
                {...form.getInputProps('createInitialTransaction', {
                  type: 'checkbox',
                })}
              />
              {hasSpecificFields && renderSpecificFields()}
            </Stack>
          </AppSection>

          <Group>
            <Button type="submit">Create account</Button>
            <Button
              variant="outline"
              onClick={() => {
                navigate({ to: '/accounts' });
              }}
            >
              Cancel
            </Button>
          </Group>
        </Stack>
      </form>
    </BaseScreen>
  );
}
