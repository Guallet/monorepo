import { CurrencyPicker } from '@/components/CurrencyPicker/CurrencyPicker';
import { AccountInput } from '@/features/accounts/components/AccountInput';
import { CategoryPicker } from '@/features/categories/components/CategoryPicker/CategoryPicker';
import { CategoryDto } from '@guallet/api-client';
import { useAccounts, useCategory } from '@guallet/api-react';
import { Currency } from '@guallet/money';
import {
  NumberInput,
  SegmentedControl,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { UseFormReturnType } from '@mantine/form';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';

export type TransactionFormData = {
  type: 'expense' | 'income';
  accountId: string;
  description: string;
  notes?: string | null;
  amount: number;
  currency: string | null;
  date: Date;
  categoryId?: string | null;
};

interface TransactionFormFieldsProps {
  form: UseFormReturnType<TransactionFormData>;
  translationKeyPrefix:
    | 'screens.transactions.create'
    | 'screens.transactions.edit';
}

export function TransactionFormFields({
  form,
  translationKeyPrefix,
}: Readonly<TransactionFormFieldsProps>) {
  const { t } = useTranslation();
  const { accounts } = useAccounts();
  const { category: selectedCategory } = useCategory(
    form.values.categoryId ?? null,
  );
  const defaultCurrency = useDefaultCurrency();
  const previousAccountIdRef = useRef<string | null>(null);

  const selectedCurrency = form.values.currency
    ? Currency.fromISOCode(form.values.currency)
    : Currency.fromISOCode(defaultCurrency);

  useEffect(() => {
    const accountId = form.values.accountId || null;

    const accountChanged = accountId !== previousAccountIdRef.current;

    previousAccountIdRef.current = accountId;

    const accountCurrency =
      accounts.find((account) => account.id === accountId)?.currency ?? null;

    const currencyMissing = !form.values.currency;

    if (accountCurrency && (accountChanged || currencyMissing)) {
      form.setFieldValue('currency', accountCurrency);
    }
  }, [accounts, form, form.values.accountId, form.values.currency]);

  return (
    <Stack>
      <SegmentedControl
        value={form.values.type}
        onChange={(value) =>
          form.setFieldValue('type', value as 'expense' | 'income')
        }
        data={[
          {
            value: 'expense',
            label: t(`${translationKeyPrefix}.form.type.expense`, 'Expense'),
          },
          {
            value: 'income',
            label: t(`${translationKeyPrefix}.form.type.income`, 'Income'),
          },
        ]}
        fullWidth
        withItemsBorders
      />
      <TextInput
        required
        label={t(
          `${translationKeyPrefix}.form.description.label`,
          'Description',
        )}
        placeholder={t(
          `${translationKeyPrefix}.form.description.placeholder`,
          'Enter transaction description',
        )}
        {...form.getInputProps('description')}
      />
      <Textarea
        resize="vertical"
        label={t(`${translationKeyPrefix}.form.notes.label`, 'Notes')}
        placeholder={t(
          `${translationKeyPrefix}.form.notes.placeholder`,
          'Enter transaction notes',
        )}
        {...form.getInputProps('notes')}
      />
      <AccountInput
        required
        label={t(`${translationKeyPrefix}.form.account.label`, 'Account')}
        placeholder={t(
          `${translationKeyPrefix}.form.account.placeholder`,
          'Select an account',
        )}
        {...form.getInputProps('accountId')}
      />
      <CurrencyPicker
        name="currency"
        required
        value={form.values.currency}
        label={t(`${translationKeyPrefix}.form.currency.label`, 'Currency')}
        description={t(
          `${translationKeyPrefix}.form.currency.description`,
          'The currency of the transaction',
        )}
        onValueChanged={(newValue) => {
          form.setFieldValue('currency', newValue);
        }}
      />
      <NumberInput
        required
        label={t(`${translationKeyPrefix}.form.amount.label`, 'Amount')}
        placeholder={t(
          `${translationKeyPrefix}.form.amount.placeholder`,
          'Enter transaction amount',
        )}
        fixedDecimalScale
        leftSection={selectedCurrency.symbol}
        decimalScale={selectedCurrency.decimalPlaces}
        {...form.getInputProps('amount')}
      />

      <DateInput
        required
        label={t(`${translationKeyPrefix}.form.date.label`, 'Date')}
        placeholder={t(
          `${translationKeyPrefix}.form.date.placeholder`,
          'Select transaction date',
        )}
        maxDate={new Date()}
        {...form.getInputProps('date')}
      />
      <CategoryPicker
        mode="single"
        label={t(`${translationKeyPrefix}.form.category.label`, 'Category')}
        placeholder={t(
          `${translationKeyPrefix}.form.category.placeholder`,
          'Select a category',
        )}
        selectedCategory={selectedCategory ?? null}
        onSelectionChanged={(selectedCategoryValue: CategoryDto) => {
          form.setFieldValue('categoryId', selectedCategoryValue.id || null);
        }}
      />
    </Stack>
  );
}
