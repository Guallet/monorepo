import { AppSection } from '@/components/Cards/AppSection';
import { CurrencyPicker } from '@/components/CurrencyPicker/CurrencyPicker';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { AccountTypeDto, UpdateAccountRequest } from '@guallet/api-client';
import { useAccount, useAccountMutations } from '@guallet/api-react';
import { Currency } from '@guallet/money';
import {
  Stack,
  TextInput,
  NativeSelect,
  rem,
  NumberInput,
  Group,
  Button,
  Checkbox,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconChevronDown } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useEffect } from 'react';
import { z } from 'zod';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';

interface EditAccountScreenProps {
  accountId: string;
}

const editAccountFormDataSchema = z.object({
  name: z.string().min(1, { message: 'Account name is required' }),
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
    initialValues: {
      name: account?.name ?? '',
      account_type: account?.type ?? AccountTypeDto.CURRENT_ACCOUNT,
      currency: account?.currency ?? defaultCurrency,
      balance: account?.balance.amount ?? 0,
      balanceTransactionCheck: true,
    },
    validate: zodResolver(editAccountFormDataSchema),
  });
  const { values } = form;
  const currency = Currency.fromISOCode(values.currency);

  useEffect(() => {
    if (account) {
      form.setValues({
        name: account.name,
        account_type: account.type,
        currency: account.currency,
        balance: account.balance.amount,
        balanceTransactionCheck: true,
      });
    }
  }, [account]);

  const accountTypes = Object.entries(AccountTypeDto).map(
    ({ '0': name, '1': accountType }) => {
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
      <form onSubmit={form.onSubmit((values) => onFormSubmit(values))}>
        <Stack>
          <AppSection title="Account details">
            <Stack>
              <TextInput
                key={form.key('name')}
                {...form.getInputProps('name')}
                required
                label="Account name"
                placeholder="Enter account name"
                error={form.errors.name}
              />
              <NativeSelect
                key={form.key('account_type')}
                {...form.getInputProps('account_type')}
                required
                rightSection={
                  <IconChevronDown
                    style={{ width: rem(16), height: rem(16) }}
                  />
                }
                label="Account type"
                data={accountTypes}
              />
              <CurrencyPicker
                name="currency"
                required
                value={form.values.currency}
                onValueChanged={(newValue) => {
                  form.setFieldValue('currency', newValue);
                }}
              />
              <NumberInput
                key={form.key('balance')}
                {...form.getInputProps('balance', {
                  parser: (value: string) => {
                    return value ? Number.parseFloat(value) : 0;
                  },
                  formatter: (value) => {
                    return value?.toString() || '';
                  },
                })}
                label="Balance"
                required
                description="Current balance of the account"
                leftSection={currency.symbol}
                decimalScale={currency.decimalPlaces}
              />
              <Checkbox
                name="balance-transaction"
                checked={values.balanceTransactionCheck}
                onChange={(event) =>
                  form.setFieldValue(
                    'balanceTransactionCheck',
                    event.currentTarget.checked,
                  )
                }
                label="(Recommended) Create a new transaction to sync the balance"
                description="This will create a new transaction in the account to match the balance, so it's easier to track balance changes."
              />
            </Stack>
          </AppSection>
          <Group>
            <Button type="submit">Update account</Button>
            <Button
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
