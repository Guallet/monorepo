import { AppSection } from '@/components/Cards/AppSection';
import { CurrencyPicker } from '@/components/CurrencyPicker/CurrencyPicker';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { zodResolver } from '@hookform/resolvers/zod';
import { AccountTypeDto, CreateAccountRequest } from '@guallet/api-client';
import { useAccountMutations } from '@guallet/api-react';
import { Currency } from '@guallet/money';
import { notifications } from '@/lib/notifications';
import { useNavigate } from '@tanstack/react-router';
import React, { type ChangeEvent, type ReactNode } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { getAccountTypeTitleSingular } from '../models/Account';
import {
  AddAccountFormData,
  accountFormDataSchema,
  getAccountProperties,
  hasSpecificStep,
} from './addAccountFormSchema';

/** Used for required numeric fields - empty string becomes 0. */
function parseNumberValue(value: string | number): number {
  if (typeof value === 'number') {
    return Number.isNaN(value) ? 0 : value;
  }

  const parsedValue = Number.parseFloat(value);
  return Number.isNaN(parsedValue) ? 0 : parsedValue;
}

/** Used for optional/nullable numeric fields - empty string becomes null. */
function parseNullableNumberValue(value: string | number): number | null {
  if (value === '') {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) ? null : value;
  }

  const parsedValue = Number.parseFloat(value);
  return Number.isNaN(parsedValue) ? null : parsedValue;
}

interface StackProps {
  children: ReactNode;
}

function Stack({ children }: Readonly<StackProps>) {
  return <div className="space-y-4">{children}</div>;
}

interface GroupProps {
  children: ReactNode;
}

function Group({ children }: Readonly<GroupProps>) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, description, error, id, className, ...props }, ref) => {
    return (
      <div className="grid gap-2">
        <Label htmlFor={id}>{label}</Label>
        <Input id={id} ref={ref} className={className} {...props} />
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    );
  },
);

TextInput.displayName = 'TextInput';

interface SelectDataOption {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  required?: boolean;
  searchable?: boolean;
  data: SelectDataOption[];
  value?: string;
  onChange?: (value: string | null) => void;
  error?: string;
}

function Select({
  label,
  required,
  data,
  value,
  onChange,
  error,
}: Readonly<SelectProps>) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <select
        required={required}
        value={value ?? ''}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          onChange?.(nextValue === '' ? null : nextValue);
        }}
        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {data.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

interface NumberInputProps {
  label: string;
  required?: boolean;
  description?: string;
  leftSection?: ReactNode;
  decimalScale?: number;
  value?: number | string | null;
  onChange?: (value: string | number) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  name?: string;
  min?: number;
  max?: number;
  error?: string;
}

function NumberInput({
  label,
  required,
  description,
  leftSection,
  decimalScale,
  value,
  onChange,
  onBlur,
  name,
  min,
  max,
  error,
}: Readonly<NumberInputProps>) {
  const hasLeftSection = Boolean(leftSection);
  const normalizedValue = value ?? '';
  const step =
    decimalScale !== undefined && decimalScale > 0
      ? Number((1 / 10 ** decimalScale).toFixed(decimalScale))
      : 1;

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="relative">
        {hasLeftSection ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {leftSection}
          </span>
        ) : null}
        <Input
          type="number"
          required={required}
          min={min}
          max={max}
          step={step}
          value={normalizedValue}
          onBlur={onBlur}
          name={name}
          className={hasLeftSection ? 'pl-8' : undefined}
          onChange={(event) => {
            const nextValue = event.currentTarget.value;
            if (nextValue === '') {
              onChange?.('');
              return;
            }

            const parsedValue = Number(nextValue);
            if (Number.isNaN(parsedValue)) {
              onChange?.(nextValue);
              return;
            }

            onChange?.(parsedValue);
          }}
        />
      </div>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

interface CheckboxProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

function Checkbox({
  label,
  description,
  checked,
  onChange,
  onBlur,
}: Readonly<CheckboxProps>) {
  return (
    <label className="flex items-start gap-2 rounded-md border p-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        onBlur={onBlur}
        className="mt-1 h-4 w-4"
      />
      <span className="space-y-1">
        <span className="block text-sm font-medium">{label}</span>
        {description ? (
          <span className="block text-sm text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export function AddAccountScreen() {
  const navigate = useNavigate();
  const { createAccountMutation } = useAccountMutations();
  const defaultCurrency = useDefaultCurrency();

  const form = useForm<AddAccountFormData>({
    resolver: zodResolver(accountFormDataSchema),
    defaultValues: {
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
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const accountType = useWatch({
    control,
    name: 'account_type',
  });
  const currencyValue = useWatch({
    control,
    name: 'currency',
  });

  const currency = currencyValue ? Currency.fromISOCode(currencyValue) : null;

  const accountTypes = Object.values(AccountTypeDto).map((accountType) => ({
    label: getAccountTypeTitleSingular(accountType),
    value: accountType,
  }));

  const currentAccountType = accountType ?? AccountTypeDto.CURRENT_ACCOUNT;
  const hasSpecificFields = hasSpecificStep(currentAccountType);

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
    switch (currentAccountType) {
      case AccountTypeDto.CURRENT_ACCOUNT:
        return (
          <Stack>
            <Controller
              name="currentAccountNumber"
              control={control}
              render={({ field }) => (
                <TextInput
                  label="Account number"
                  placeholder="Enter account number"
                  value={field.value ?? ''}
                  onChange={(event) => {
                    field.onChange(event.currentTarget.value);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  error={errors.currentAccountNumber?.message}
                />
              )}
            />
            <Controller
              name="currentSortCode"
              control={control}
              render={({ field }) => (
                <TextInput
                  label="Sort code"
                  placeholder="00-00-00"
                  value={field.value ?? ''}
                  onChange={(event) => {
                    field.onChange(event.currentTarget.value);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  error={errors.currentSortCode?.message}
                />
              )}
            />
            <Controller
              name="currentOverdraftLimit"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Overdraft limit"
                  description="Optional"
                  leftSection={currency?.symbol}
                  decimalScale={currency?.decimalPlaces}
                  value={field.value ?? ''}
                  onChange={(value) => {
                    field.onChange(parseNullableNumberValue(value));
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  error={errors.currentOverdraftLimit?.message}
                />
              )}
            />
          </Stack>
        );
      case AccountTypeDto.CREDIT_CARD:
        return (
          <Stack>
            <Controller
              name="creditCardAccountNumber"
              control={control}
              render={({ field }) => (
                <TextInput
                  label="Account number"
                  placeholder="Enter account number"
                  value={field.value ?? ''}
                  onChange={(event) => {
                    field.onChange(event.currentTarget.value);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  error={errors.creditCardAccountNumber?.message}
                />
              )}
            />
            <Controller
              name="creditCardInterestRate"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Interest rate"
                  leftSection="%"
                  decimalScale={2}
                  value={field.value ?? ''}
                  onChange={(value) => {
                    field.onChange(parseNullableNumberValue(value));
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  error={errors.creditCardInterestRate?.message}
                />
              )}
            />
            <Controller
              name="creditCardCreditLimit"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Credit limit"
                  leftSection={currency?.symbol}
                  decimalScale={currency?.decimalPlaces}
                  value={field.value ?? ''}
                  onChange={(value) => {
                    field.onChange(parseNullableNumberValue(value));
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  error={errors.creditCardCreditLimit?.message}
                />
              )}
            />
            <Controller
              name="creditCardCycleDay"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Cycle day"
                  min={1}
                  max={31}
                  value={field.value ?? ''}
                  onChange={(value) => {
                    field.onChange(parseNullableNumberValue(value));
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  error={errors.creditCardCycleDay?.message}
                />
              )}
            />
          </Stack>
        );
      case AccountTypeDto.SAVINGS:
        return (
          <Stack>
            <Controller
              name="savingsInterestRate"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Interest rate"
                  leftSection="%"
                  decimalScale={2}
                  value={field.value ?? ''}
                  onChange={(value) => {
                    field.onChange(parseNullableNumberValue(value));
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  error={errors.savingsInterestRate?.message}
                />
              )}
            />
          </Stack>
        );
      case AccountTypeDto.MORTGAGE:
        return (
          <Stack>
            <Controller
              name="mortgagePropertyValue"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Property value"
                  leftSection={currency?.symbol}
                  decimalScale={currency?.decimalPlaces}
                  value={field.value ?? ''}
                  onChange={(value) => {
                    field.onChange(parseNullableNumberValue(value));
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  error={errors.mortgagePropertyValue?.message}
                />
              )}
            />
            <Controller
              name="mortgageAmount"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Mortgage amount"
                  leftSection={currency?.symbol}
                  decimalScale={currency?.decimalPlaces}
                  value={field.value ?? ''}
                  onChange={(value) => {
                    field.onChange(parseNullableNumberValue(value));
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  error={errors.mortgageAmount?.message}
                />
              )}
            />
            <Controller
              name="mortgageInterestRate"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Interest rate"
                  leftSection="%"
                  decimalScale={2}
                  value={field.value ?? ''}
                  onChange={(value) => {
                    field.onChange(parseNullableNumberValue(value));
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  error={errors.mortgageInterestRate?.message}
                />
              )}
            />
            <Controller
              name="mortgageTermLength"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Term length"
                  description="Years"
                  value={field.value ?? ''}
                  onChange={(value) => {
                    field.onChange(parseNullableNumberValue(value));
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  error={errors.mortgageTermLength?.message}
                />
              )}
            />
          </Stack>
        );
      case AccountTypeDto.LOAN:
        return (
          <Stack>
            <Controller
              name="loanAmount"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Loan amount"
                  leftSection={currency?.symbol}
                  decimalScale={currency?.decimalPlaces}
                  value={field.value ?? ''}
                  onChange={(value) => {
                    field.onChange(parseNullableNumberValue(value));
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  error={errors.loanAmount?.message}
                />
              )}
            />
            <Controller
              name="loanInterestRate"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Interest rate"
                  leftSection="%"
                  decimalScale={2}
                  value={field.value ?? ''}
                  onChange={(value) => {
                    field.onChange(parseNullableNumberValue(value));
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  error={errors.loanInterestRate?.message}
                />
              )}
            />
            <Controller
              name="loanTermLength"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Term length"
                  description="Years"
                  value={field.value ?? ''}
                  onChange={(value) => {
                    field.onChange(parseNullableNumberValue(value));
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  error={errors.loanTermLength?.message}
                />
              )}
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
        onSubmit={handleSubmit(onFormSubmit, () => {
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
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextInput
                    required
                    label="Account name"
                    placeholder="Enter account name"
                    value={field.value}
                    onChange={(event) => {
                      field.onChange(event.currentTarget.value);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    error={errors.name?.message}
                  />
                )}
              />
              <Controller
                name="account_type"
                control={control}
                render={({ field }) => (
                  <Select
                    required
                    label="Account type"
                    searchable
                    data={accountTypes}
                    value={field.value}
                    onChange={(value) => {
                      if (!value) {
                        return;
                      }
                      field.onChange(value as AccountTypeDto);
                    }}
                    error={errors.account_type?.message}
                  />
                )}
              />
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <CurrencyPicker
                    name={field.name}
                    required
                    value={field.value}
                    onValueChanged={field.onChange}
                    error={errors.currency?.message}
                  />
                )}
              />
              <Controller
                name="balance"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    label="Initial balance"
                    required
                    description="Initial balance of the account"
                    leftSection={currency?.symbol}
                    decimalScale={currency?.decimalPlaces}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(parseNumberValue(value));
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    error={errors.balance?.message}
                  />
                )}
              />
              <Controller
                name="createInitialTransaction"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    label="Create initial balance transaction"
                    description="If checked, an initial transaction will be created to reflect the starting balance"
                    checked={field.value}
                    onChange={(event) => {
                      field.onChange(event.currentTarget.checked);
                    }}
                    onBlur={field.onBlur}
                  />
                )}
              />
              {hasSpecificFields && renderSpecificFields()}
            </Stack>
          </AppSection>

          <Group>
            <Button type="submit">Create account</Button>
            <Button
              type="button"
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
