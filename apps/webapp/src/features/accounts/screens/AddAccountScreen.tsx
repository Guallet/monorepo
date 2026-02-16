import { AppSection } from '@/components/Cards/AppSection';
import { CurrencyPicker } from '@/components/CurrencyPicker/CurrencyPicker';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { AccountTypeDto, CreateAccountRequest } from '@guallet/api-client';
import { useAccountMutations } from '@guallet/api-react';
import { Currency } from '@guallet/money';
import {
  Alert,
  Button,
  Group,
  NativeSelect,
  NumberInput,
  rem,
  SimpleGrid,
  Stack,
  Stepper,
  Text,
  TextInput,
  Checkbox,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconChevronDown, IconInfoCircle } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { getAccountTypeTitleSingular } from '../models/Account';
import {
  accountFormBaseSchema,
  accountFormDataSchema,
  AddAccountFormData,
  getAccountProperties,
  getCommonStepFields,
  getSpecificStepFields,
  getSummaryEntries,
  hasSpecificStep,
} from './addAccountFormSchema';

function getNumberParser(value: string): number {
  return value ? Number.parseFloat(value) : 0;
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

  const [currentStep, setCurrentStep] = useState(0);

  const accountTypes = Object.entries(AccountTypeDto).map(
    ({ '1': accountType }) => ({
      label: getAccountTypeTitleSingular(accountType),
      value: accountType,
    }),
  );

  const hasSecondStep = hasSpecificStep(values.account_type);
  const summaryStep = hasSecondStep ? 2 : 1;

  const setFieldIssues = (fields: Array<keyof AddAccountFormData>, issues: Array<{ field: string; message: string }>) => {
    fields.forEach((field) => {
      form.clearFieldError(field);
    });

    issues.forEach((issue) => {
      form.setFieldError(issue.field, issue.message);
    });
  };

  const validateCommonStep = (): boolean => {
    const result = accountFormBaseSchema.pick({
      name: true,
      currency: true,
      balance: true,
      createInitialTransaction: true,
      account_type: true,
    }).safeParse(form.values);

    const fields = getCommonStepFields();
    if (result.success) {
      setFieldIssues(fields, []);
      return true;
    }

    const issues = result.error.issues
      .map((issue) => ({
        field: String(issue.path[0] ?? ''),
        message: issue.message,
      }))
      .filter((issue) => fields.includes(issue.field as keyof AddAccountFormData));

    setFieldIssues(fields, issues);
    return issues.length === 0;
  };

  const validateSpecificStep = (): boolean => {
    const fields = getSpecificStepFields(values.account_type);
    if (!fields.length) {
      return true;
    }

    const result = accountFormDataSchema.safeParse(form.values);

    if (result.success) {
      setFieldIssues(fields, []);
      return true;
    }

    const issues = result.error.issues
      .map((issue) => ({
        field: String(issue.path[0] ?? ''),
        message: issue.message,
      }))
      .filter((issue) => fields.includes(issue.field as keyof AddAccountFormData));

    setFieldIssues(fields, issues);
    return issues.length === 0;
  };

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
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              required
              label="Account number"
              placeholder="Enter account number"
              {...form.getInputProps('currentAccountNumber')}
            />
            <TextInput
              required
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
                parser: getNumberParser,
              })}
            />
          </SimpleGrid>
        );
      case AccountTypeDto.CREDIT_CARD:
        return (
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              required
              label="Account number"
              placeholder="Enter account number"
              {...form.getInputProps('creditCardAccountNumber')}
            />
            <NumberInput
              required
              label="Interest rate"
              leftSection="%"
              decimalScale={2}
              {...form.getInputProps('creditCardInterestRate', {
                parser: getNumberParser,
              })}
            />
            <NumberInput
              required
              label="Credit limit"
              leftSection={currency?.symbol}
              decimalScale={currency?.decimalPlaces}
              {...form.getInputProps('creditCardCreditLimit', {
                parser: getNumberParser,
              })}
            />
            <NumberInput
              required
              label="Cycle day"
              min={1}
              max={31}
              {...form.getInputProps('creditCardCycleDay', {
                parser: getNumberParser,
              })}
            />
          </SimpleGrid>
        );
      case AccountTypeDto.SAVINGS:
        return (
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <NumberInput
              required
              label="Interest rate"
              leftSection="%"
              decimalScale={2}
              {...form.getInputProps('savingsInterestRate', {
                parser: getNumberParser,
              })}
            />
          </SimpleGrid>
        );
      case AccountTypeDto.MORTGAGE:
        return (
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <NumberInput
              required
              label="Property value"
              leftSection={currency?.symbol}
              decimalScale={currency?.decimalPlaces}
              {...form.getInputProps('mortgagePropertyValue', {
                parser: getNumberParser,
              })}
            />
            <NumberInput
              required
              label="Mortgage amount"
              leftSection={currency?.symbol}
              decimalScale={currency?.decimalPlaces}
              {...form.getInputProps('mortgageAmount', {
                parser: getNumberParser,
              })}
            />
            <NumberInput
              required
              label="Interest rate"
              leftSection="%"
              decimalScale={2}
              {...form.getInputProps('mortgageInterestRate', {
                parser: getNumberParser,
              })}
            />
            <NumberInput
              required
              label="Term length"
              description="Years"
              {...form.getInputProps('mortgageTermLength', {
                parser: getNumberParser,
              })}
            />
          </SimpleGrid>
        );
      case AccountTypeDto.LOAN:
        return (
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <NumberInput
              required
              label="Loan amount"
              leftSection={currency?.symbol}
              decimalScale={currency?.decimalPlaces}
              {...form.getInputProps('loanAmount', {
                parser: getNumberParser,
              })}
            />
            <NumberInput
              required
              label="Interest rate"
              leftSection="%"
              decimalScale={2}
              {...form.getInputProps('loanInterestRate', {
                parser: getNumberParser,
              })}
            />
            <NumberInput
              required
              label="Term length"
              description="Years"
              {...form.getInputProps('loanTermLength', {
                parser: getNumberParser,
              })}
            />
          </SimpleGrid>
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
              <Stepper active={currentStep}>
                <Stepper.Step label="Step 1" description="Common fields">
                  <Stack mt="md">
                    <SimpleGrid cols={{ base: 1, sm: 2 }}>
                      <TextInput
                        required
                        label="Account name"
                        placeholder="Enter account name"
                        {...form.getInputProps('name')}
                      />
                      <NativeSelect
                        required
                        rightSection={
                          <IconChevronDown
                            style={{ width: rem(16), height: rem(16) }}
                          />
                        }
                        label="Account type"
                        data={accountTypes}
                        {...form.getInputProps('account_type')}
                        onChange={(event) => {
                          const type = event.currentTarget.value as AccountTypeDto;
                          form.setFieldValue('account_type', type);
                          const nextSummaryStep = hasSpecificStep(type) ? 2 : 1;
                          if (currentStep > nextSummaryStep) {
                            setCurrentStep(nextSummaryStep);
                          }
                        }}
                      />
                    </SimpleGrid>

                    <SimpleGrid cols={{ base: 1, sm: 2 }}>
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
                    </SimpleGrid>

                    <Checkbox
                      label="Create initial balance transaction"
                      description="If checked, an initial transaction will be created to reflect the starting balance"
                      {...form.getInputProps('createInitialTransaction', {
                        type: 'checkbox',
                      })}
                    />
                  </Stack>
                </Stepper.Step>

                {hasSecondStep && (
                  <Stepper.Step
                    label="Step 2"
                    description="Account-type specific details"
                  >
                    <Stack mt="md">{renderSpecificFields()}</Stack>
                  </Stepper.Step>
                )}

                <Stepper.Step label="Summary" description="Confirm details">
                  <Stack mt="md">
                    <Alert icon={<IconInfoCircle size={16} />} color="blue">
                      Please review the account details before final submission.
                    </Alert>
                    <SimpleGrid cols={{ base: 1, sm: 2 }}>
                      {getSummaryEntries(values).map(([label, value]) => (
                        <Text key={label}>
                          <Text span fw={600}>
                            {label}:
                          </Text>{' '}
                          {value}
                        </Text>
                      ))}
                    </SimpleGrid>
                  </Stack>
                </Stepper.Step>
              </Stepper>
            </Stack>
          </AppSection>

          <Group>
            {currentStep > 0 && (
              <Button
                variant="default"
                onClick={() => {
                  setCurrentStep(currentStep - 1);
                }}
              >
                Back
              </Button>
            )}

            {currentStep < summaryStep && (
              <Button
                onClick={() => {
                  if (currentStep === 0) {
                    if (!validateCommonStep()) {
                      return;
                    }
                    setCurrentStep(1);
                    return;
                  }

                  if (hasSecondStep && !validateSpecificStep()) {
                    return;
                  }

                  setCurrentStep(summaryStep);
                }}
              >
                Continue
              </Button>
            )}

            {currentStep === summaryStep && <Button type="submit">Create account</Button>}

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
