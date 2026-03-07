import { AppSection } from '@/components/Cards/AppSection';
import { CurrencyPicker } from '@/components/CurrencyPicker/CurrencyPicker';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { AccountTypeDto, UpdateAccountRequest } from '@guallet/api-client';
import { useAccount, useAccountMutations } from '@guallet/api-react';
import { Currency } from '@guallet/money';
import { notifications } from '@/lib/notifications';
import { useNavigate } from '@tanstack/react-router';
import React, { useEffect, type ChangeEvent, type ReactNode } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';

interface EditAccountScreenProps {
  accountId: string;
}

const editAccountFormDataSchema = z.object({
  name: z.string().min(1, { error: 'Account name is required' }),
  currency: z.string().default('GBP'),
  account_type: z.enum(AccountTypeDto).default(AccountTypeDto.UNKNOWN),
  balance: z.number().default(0),
  balanceTransactionCheck: z.boolean().default(true),
});
type EditAccountFormData = z.infer<typeof editAccountFormDataSchema>;

function getLocalizedType(name: AccountTypeDto): string {
  // Temporary English labels until dedicated translation keys are wired in.
  switch (name) {
    case AccountTypeDto.CREDIT_CARD:
      return 'Credit Card';
    case AccountTypeDto.CURRENT_ACCOUNT:
      return 'Current account';
    case AccountTypeDto.INVESTMENT:
      return 'Investment';
    case AccountTypeDto.LOAN:
      return 'Loan';
    case AccountTypeDto.MORTGAGE:
      return 'Mortgage';
    case AccountTypeDto.PENSION:
      return 'Pension';
    case AccountTypeDto.SAVINGS:
      return 'Savings account';
    case AccountTypeDto.UNKNOWN:
    default:
      return 'Other';
  }
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
  ({ label, description, error, id, className, ...props }, ref) => (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} ref={ref} className={className} {...props} />
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  ),
);

TextInput.displayName = 'TextInput';

interface NativeSelectDataOption {
  label: string;
  value: string;
}

interface NativeSelectProps {
  label: string;
  required?: boolean;
  data: NativeSelectDataOption[];
  value?: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
}

function NativeSelect({
  label,
  required,
  data,
  value,
  onChange,
  error,
}: Readonly<NativeSelectProps>) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <select
        required={required}
        value={value ?? ''}
        onChange={onChange}
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
  name?: string;
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  label: string;
  description?: string;
}

function Checkbox({
  name,
  checked,
  onChange,
  onBlur,
  label,
  description,
}: Readonly<CheckboxProps>) {
  return (
    <label className="flex items-start gap-2 rounded-md border p-3">
      <input
        type="checkbox"
        name={name}
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

export function EditAccountScreen({
  accountId,
}: Readonly<EditAccountScreenProps>) {
  const { account, isLoading } = useAccount(accountId);
  const defaultCurrency = useDefaultCurrency();
  const navigate = useNavigate();

  const { updateAccountMutation } = useAccountMutations();

  const form = useForm<EditAccountFormData>({
    resolver: zodResolver(editAccountFormDataSchema),
    defaultValues: {
      name: account?.name ?? '',
      account_type: account?.type ?? AccountTypeDto.CURRENT_ACCOUNT,
      currency: account?.currency ?? defaultCurrency,
      balance: account?.balance.amount ?? 0,
      balanceTransactionCheck: true,
    },
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const selectedCurrency = useWatch({
    control,
    name: 'currency',
  });
  const balanceTransactionCheck = useWatch({
    control,
    name: 'balanceTransactionCheck',
  });

  const currency = Currency.fromISOCode(selectedCurrency ?? defaultCurrency);

  useEffect(() => {
    if (account) {
      form.reset({
        name: account.name,
        account_type: account.type,
        currency: account.currency,
        balance: account.balance.amount,
        balanceTransactionCheck: true,
      });
    }
  }, [account, form]);

  const accountTypes = Object.entries(AccountTypeDto).map(
    ({ '1': accountType }) => {
      return {
        label: getLocalizedType(accountType),
        value: accountType,
      };
    },
  );

  async function onFormSubmit(data: EditAccountFormData) {
    console.log('onFormSubmit', data);
    const accountRequest: UpdateAccountRequest = {
      name: data.name,
      type: data.account_type,
      currency: data.currency,
      balance: data.balance,
      create_balance_transaction: data.balanceTransactionCheck,
    };
    try {
      const updatedAccount = await updateAccountMutation.mutateAsync({
        id: accountId,
        request: accountRequest,
      });
      notifications.show({
        title: 'Account updated',
        message: `Account ${updatedAccount.name} updated`,
        color: 'green',
      });
      navigate({
        to: '/accounts/$id',
        params: {
          id: updatedAccount.id,
        },
      });
    } catch (error) {
      console.error('Error creating the account', error);
    }
  }

  return (
    <BaseScreen isLoading={isLoading}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Stack>
          <AppSection title="Account details">
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
                  <NativeSelect
                    required
                    rightSection={
                      <IconChevronDown
                        style={{ width: rem(16), height: rem(16) }}
                      />
                    }
                    label="Account type"
                    data={accountTypes}
                    value={field.value}
                    onChange={(event) => {
                      field.onChange(
                        event.currentTarget.value as AccountTypeDto,
                      );
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
                    onValueChanged={(newValue) => {
                      field.onChange(newValue ?? defaultCurrency);
                    }}
                    error={errors.currency?.message}
                  />
                )}
              />
              <Controller
                name="balance"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    label="Balance"
                    required
                    description="Current balance of the account"
                    leftSection={currency.symbol}
                    decimalScale={currency.decimalPlaces}
                    value={field.value}
                    onChange={(value) => {
                      const parsedValue =
                        typeof value === 'number' ? value : Number(value || 0);
                      field.onChange(
                        Number.isNaN(parsedValue) ? 0 : parsedValue,
                      );
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    error={errors.balance?.message}
                  />
                )}
              />
              <Controller
                name="balanceTransactionCheck"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    name="balance-transaction"
                    checked={balanceTransactionCheck}
                    onChange={(event) => {
                      field.onChange(event.currentTarget.checked);
                    }}
                    onBlur={field.onBlur}
                    label="(Recommended) Create a new transaction to sync the balance"
                    description="This will create a new transaction in the account to match the balance, so it's easier to track balance changes."
                  />
                )}
              />
            </Stack>
          </AppSection>
          <Group>
            <Button type="submit">Update account</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Go back
                navigate({
                  to: '/accounts/$id',
                  params: { id: accountId },
                });
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
