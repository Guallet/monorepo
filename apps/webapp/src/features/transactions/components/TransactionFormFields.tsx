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
import { useEffect, useRef, useState } from 'react';
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
  accountReadOnly?: boolean;
  isCategoryRequired?: boolean;
}

export function TransactionFormFields({
  form,
  translationKeyPrefix,
  accountReadOnly = false,
  isCategoryRequired = false,
}: Readonly<TransactionFormFieldsProps>) {
  const { t } = useTranslation();
  const { accounts } = useAccounts();
  const { category } = useCategory(form.values.categoryId ?? null);
  const defaultCurrency = useDefaultCurrency();
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(
    null,
  );
  const previousAccountIdRef = useRef<string | null>(null);

  const selectedCurrency = form.values.currency
    ? Currency.fromISOCode(form.values.currency)
    : Currency.fromISOCode(defaultCurrency);

  useEffect(() => {
    setSelectedCategory(category);
  }, [category]);

  useEffect(() => {
    const accountId = form.values.accountId || null;

    if (accountId === previousAccountIdRef.current) {
      return;
    }

    previousAccountIdRef.current = accountId;

    const accountCurrency =
      accounts.find((account) => account.id === accountId)?.currency ?? null;

    if (accountCurrency) {
      form.setFieldValue('currency', accountCurrency);
    }
  }, [accounts, form, form.values.accountId]);

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
        disabled={accountReadOnly}
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
        required={isCategoryRequired}
        label={t(`${translationKeyPrefix}.form.category.label`, 'Category')}
        placeholder={t(
          `${translationKeyPrefix}.form.category.placeholder`,
          'Select a category',
        )}
        selectedCategory={selectedCategory}
        onCategorySelected={(selectedCategoryValue: CategoryDto) => {
          setSelectedCategory(selectedCategoryValue);
          form.setFieldValue('categoryId', selectedCategoryValue.id || null);
        }}
      />
    </Stack>
  );
}
