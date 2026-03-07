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
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import type { TransactionFormData } from '../models/TransactionForm';

interface TransactionFormFieldsProps {
  form: UseFormReturn<TransactionFormData>;
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
  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = form;
  const categoryId = watch('categoryId') ?? null;
  const accountId = watch('accountId') || null;
  const selectedFormCurrency = watch('currency');

  const { category } = useCategory(categoryId);
  const defaultCurrency = useDefaultCurrency();
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(
    null,
  );
  const previousAccountIdRef = useRef<string | null>(null);

  const selectedCurrency = selectedFormCurrency
    ? Currency.fromISOCode(selectedFormCurrency)
    : Currency.fromISOCode(defaultCurrency);

  useEffect(() => {
    setSelectedCategory(category);
  }, [category]);

  useEffect(() => {
    const accountChanged = accountId !== previousAccountIdRef.current;

    previousAccountIdRef.current = accountId;

    const accountCurrency =
      accounts.find((account) => account.id === accountId)?.currency ?? null;

    const currencyMissing = !selectedFormCurrency;

    if (accountCurrency && (accountChanged || currencyMissing)) {
      setValue('currency', accountCurrency, { shouldDirty: true });
    }
  }, [accountId, accounts, selectedFormCurrency, setValue]);

  return (
    <Stack>
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <SegmentedControl
            value={field.value}
            onChange={(value) => field.onChange(value as 'expense' | 'income')}
            data={[
              {
                value: 'expense',
                label: t(
                  `${translationKeyPrefix}.form.type.expense`,
                  'Expense',
                ),
              },
              {
                value: 'income',
                label: t(`${translationKeyPrefix}.form.type.income`, 'Income'),
              },
            ]}
            fullWidth
            withItemsBorders
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
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
            value={field.value}
            onChange={(event) => {
              field.onChange(event.currentTarget.value);
            }}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
            error={errors.description?.message}
          />
        )}
      />
      <Controller
        name="notes"
        control={control}
        render={({ field }) => (
          <Textarea
            resize="vertical"
            label={t(`${translationKeyPrefix}.form.notes.label`, 'Notes')}
            placeholder={t(
              `${translationKeyPrefix}.form.notes.placeholder`,
              'Enter transaction notes',
            )}
            value={field.value ?? ''}
            onChange={(event) => {
              field.onChange(event.currentTarget.value);
            }}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
            error={errors.notes?.message}
          />
        )}
      />
      <Controller
        name="accountId"
        control={control}
        render={({ field }) => (
          <AccountInput
            required
            label={t(`${translationKeyPrefix}.form.account.label`, 'Account')}
            placeholder={t(
              `${translationKeyPrefix}.form.account.placeholder`,
              'Select an account',
            )}
            value={field.value || null}
            onChange={(value) => {
              field.onChange(value ?? '');
            }}
            error={errors.accountId?.message}
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
            label={t(`${translationKeyPrefix}.form.currency.label`, 'Currency')}
            description={t(
              `${translationKeyPrefix}.form.currency.description`,
              'The currency of the transaction',
            )}
            onValueChanged={field.onChange}
            error={errors.currency?.message}
          />
        )}
      />
      <Controller
        name="amount"
        control={control}
        render={({ field }) => (
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
            value={field.value}
            onChange={(value) => {
              const parsedValue =
                typeof value === 'number' ? value : Number(value || 0);
              field.onChange(Number.isNaN(parsedValue) ? 0 : parsedValue);
            }}
            onBlur={field.onBlur}
            name={field.name}
            error={errors.amount?.message}
          />
        )}
      />

      <Controller
        name="date"
        control={control}
        render={({ field }) => (
          <DateInput
            required
            label={t(`${translationKeyPrefix}.form.date.label`, 'Date')}
            placeholder={t(
              `${translationKeyPrefix}.form.date.placeholder`,
              'Select transaction date',
            )}
            maxDate={new Date()}
            value={field.value}
            onChange={(value) => {
              field.onChange(value ?? new Date());
            }}
            onBlur={field.onBlur}
            name={field.name}
            error={errors.date?.message}
          />
        )}
      />
      <Controller
        name="categoryId"
        control={control}
        render={({ field }) => (
          <CategoryPicker
            label={t(`${translationKeyPrefix}.form.category.label`, 'Category')}
            placeholder={t(
              `${translationKeyPrefix}.form.category.placeholder`,
              'Select a category',
            )}
            selectedCategory={selectedCategory}
            onCategorySelected={(selectedCategoryValue: CategoryDto) => {
              setSelectedCategory(selectedCategoryValue);
              field.onChange(selectedCategoryValue.id || null);
            }}
            error={errors.categoryId?.message}
          />
        )}
      />
    </Stack>
  );
}
