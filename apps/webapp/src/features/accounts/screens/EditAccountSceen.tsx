import { CurrencyPicker } from '@/components/CurrencyPicker/CurrencyPicker';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { AccountTypeDto, UpdateAccountRequest } from '@guallet/api-client';
import { useAccount, useAccountMutations } from '@guallet/api-react';
import { Currency } from '@guallet/money';
import { useTheme } from '@guallet/ui-react';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Group,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate } from '@tanstack/react-router';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { getAccountTypeTitleSingular } from '../models/Account';

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

export function EditAccountScreen({
  accountId,
}: Readonly<EditAccountScreenProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
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
    validate: zod4Resolver(editAccountFormDataSchema),
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
  }, [account, form]);

  const accountTypes = Object.values(AccountTypeDto).map((type) => ({
    label: getAccountTypeTitleSingular(type),
    value: type,
  }));

  async function onFormSubmit(data: EditAccountFormData) {
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
        message: t(
          'feature.accounts.edit.notifications.success',
          '{{name}} updated successfully.',
          { name: updatedAccount.name },
        ),
        color: 'green',
      });
      navigate({ to: '/accounts/$id', params: { id: updatedAccount.id } });
    } catch (error) {
      console.error('Error updating the account', error);
      notifications.show({
        title: t(
          'feature.accounts.edit.notifications.error.title',
          'Could not update account',
        ),
        message: t(
          'feature.accounts.edit.notifications.error.message',
          'A network or server error occurred. Please try again.',
        ),
        color: 'red',
      });
    }
  }

  return (
    <BaseScreen
      isLoading={isLoading}
      title={t('feature.accounts.edit.title', 'Edit account')}
    >
      <Box maw={560} mx="auto">
        <form onSubmit={form.onSubmit(onFormSubmit)}>
          <Stack gap={spacing.md}>
            <Card withBorder shadow="sm" radius="lg" padding={{ base: 'md', sm: 'lg' }}>
              <Stack gap={spacing.md}>
                <TextInput
                  key={form.key('name')}
                  required
                  label={t('feature.accounts.edit.fields.name.label', 'Account name')}
                  placeholder={t(
                    'feature.accounts.edit.fields.name.placeholder',
                    'Enter account name',
                  )}
                  error={form.errors.name}
                  {...form.getInputProps('name')}
                />
                <Select
                  key={form.key('account_type')}
                  required
                  searchable
                  label={t('feature.accounts.edit.fields.type.label', 'Account type')}
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
                    form.setFieldValue('currency', newValue ?? defaultCurrency);
                  }}
                />
                <NumberInput
                  key={form.key('balance')}
                  required
                  label={t('feature.accounts.edit.fields.balance.label', 'Balance')}
                  description={t(
                    'feature.accounts.edit.fields.balance.description',
                    'Current balance of the account',
                  )}
                  leftSection={currency.symbol}
                  decimalScale={currency.decimalPlaces}
                  {...form.getInputProps('balance', {
                    parser: (value: string) => (value ? Number.parseFloat(value) : 0),
                    formatter: (value: unknown) => value?.toString() ?? '',
                  })}
                />
                <Checkbox
                  label={t(
                    'feature.accounts.edit.fields.balanceTransaction.label',
                    'Create a transaction to sync the balance',
                  )}
                  description={t(
                    'feature.accounts.edit.fields.balanceTransaction.description',
                    'Records a transaction to match the new balance, keeping history accurate.',
                  )}
                  checked={values.balanceTransactionCheck}
                  onChange={(e) =>
                    form.setFieldValue(
                      'balanceTransactionCheck',
                      e.currentTarget.checked,
                    )
                  }
                />
              </Stack>
            </Card>

            <Stack gap="xs" hiddenFrom="sm">
              <Button type="submit" fullWidth size="md" loading={updateAccountMutation.isPending}>
                {t('feature.accounts.edit.submitButton', 'Save changes')}
              </Button>
              <Button
                variant="outline"
                fullWidth
                size="md"
                onClick={() => navigate({ to: '/accounts/$id', params: { id: accountId } })}
              >
                {t('feature.accounts.edit.cancelButton', 'Cancel')}
              </Button>
            </Stack>
            <Group justify="flex-end" gap="xs" visibleFrom="sm">
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/accounts/$id', params: { id: accountId } })}
              >
                {t('feature.accounts.edit.cancelButton', 'Cancel')}
              </Button>
              <Button type="submit" loading={updateAccountMutation.isPending}>
                {t('feature.accounts.edit.submitButton', 'Save changes')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Box>
    </BaseScreen>
  );
}
