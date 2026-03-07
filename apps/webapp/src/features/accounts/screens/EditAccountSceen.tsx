import { AppSection } from '@/components/Cards/AppSection';
import { CurrencyPicker } from '@/components/CurrencyPicker/CurrencyPicker';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { zodResolver } from '@hookform/resolvers/zod';
import { AccountTypeDto, UpdateAccountRequest } from '@guallet/api-client';
import { useAccount, useAccountMutations } from '@guallet/api-react';
import { Currency } from '@guallet/money';
import {
  Button,
  Checkbox,
  Group,
  NativeSelect,
  NumberInput,
  Stack,
  TextInput,
  rem,
} from '@mantine/core';
import { notifications } from '@/lib/notifications';
import { IconChevronDown } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
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
  // TODO: Localize this
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
