import { CurrencyPicker } from '@/components/CurrencyPicker/CurrencyPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AccountInput } from '@/features/accounts/components/AccountInput';
import { CategoryPicker } from '@/features/categories/components/CategoryPicker/CategoryPicker';
import { CategoryDto } from '@guallet/api-client';
import { useAccounts, useCategory } from '@guallet/api-react';
import { Currency } from '@guallet/money';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, type UseFormReturn, useWatch } from 'react-hook-form';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import type { TransactionFormData } from '../models/TransactionForm';

interface TransactionFormFieldsProps {
  form: UseFormReturn<TransactionFormData>;
  translationKeyPrefix:
    | 'screens.transactions.create'
    | 'screens.transactions.edit';
}

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string): Date | null {
  if (value.trim() === '') {
    return null;
  }

  const parsedDate = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function getStepForCurrency(decimalPlaces: number | undefined): number {
  if (!decimalPlaces || decimalPlaces <= 0) {
    return 1;
  }

  return 1 / 10 ** decimalPlaces;
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
  } = form;
  const categoryId = useWatch({ control, name: 'categoryId' }) ?? null;
  const accountId = useWatch({ control, name: 'accountId' }) ?? null;
  const selectedFormCurrency = useWatch({ control, name: 'currency' });

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

  const todayDate = formatDateForInput(new Date());

  return (
    <div className="flex flex-col gap-4">
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <div className="grid gap-2">
            <Label>
              {t(`${translationKeyPrefix}.form.type.label`, 'Type')}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={field.value === 'expense' ? 'default' : 'outline'}
                onClick={() => {
                  field.onChange('expense');
                }}
              >
                {t(`${translationKeyPrefix}.form.type.expense`, 'Expense')}
              </Button>
              <Button
                type="button"
                variant={field.value === 'income' ? 'default' : 'outline'}
                onClick={() => {
                  field.onChange('income');
                }}
              >
                {t(`${translationKeyPrefix}.form.type.income`, 'Income')}
              </Button>
            </div>
          </div>
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <div className="grid gap-2">
            <Label htmlFor={`${translationKeyPrefix}-transaction-description`}>
              {t(
                `${translationKeyPrefix}.form.description.label`,
                'Description',
              )}
            </Label>
            <Input
              id={`${translationKeyPrefix}-transaction-description`}
              required
              placeholder={t(
                `${translationKeyPrefix}.form.description.placeholder`,
                'Enter transaction description',
              )}
              value={field.value}
              onChange={(event) => {
                field.onChange(event.target.value);
              }}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
            {errors.description?.message ? (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            ) : null}
          </div>
        )}
      />

      <Controller
        name="notes"
        control={control}
        render={({ field }) => (
          <div className="grid gap-2">
            <Label htmlFor={`${translationKeyPrefix}-transaction-notes`}>
              {t(`${translationKeyPrefix}.form.notes.label`, 'Notes')}
            </Label>
            <textarea
              id={`${translationKeyPrefix}-transaction-notes`}
              className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder={t(
                `${translationKeyPrefix}.form.notes.placeholder`,
                'Enter transaction notes',
              )}
              value={field.value ?? ''}
              onChange={(event) => {
                field.onChange(event.target.value);
              }}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
            {errors.notes?.message ? (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            ) : null}
          </div>
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
          <div className="grid gap-2">
            <Label htmlFor={`${translationKeyPrefix}-transaction-amount`}>
              {t(`${translationKeyPrefix}.form.amount.label`, 'Amount')}
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {selectedCurrency.symbol}
              </span>
              <Input
                id={`${translationKeyPrefix}-transaction-amount`}
                type="number"
                required
                className="pl-8"
                placeholder={t(
                  `${translationKeyPrefix}.form.amount.placeholder`,
                  'Enter transaction amount',
                )}
                step={getStepForCurrency(selectedCurrency.decimalPlaces)}
                value={field.value}
                onChange={(event) => {
                  const parsedValue = Number(event.target.value);
                  field.onChange(Number.isNaN(parsedValue) ? 0 : parsedValue);
                }}
                onBlur={field.onBlur}
                name={field.name}
              />
            </div>
            {errors.amount?.message ? (
              <p className="text-sm text-destructive">
                {errors.amount.message}
              </p>
            ) : null}
          </div>
        )}
      />

      <Controller
        name="date"
        control={control}
        render={({ field }) => (
          <div className="grid gap-2">
            <Label htmlFor={`${translationKeyPrefix}-transaction-date`}>
              {t(`${translationKeyPrefix}.form.date.label`, 'Date')}
            </Label>
            <Input
              id={`${translationKeyPrefix}-transaction-date`}
              type="date"
              required
              max={todayDate}
              placeholder={t(
                `${translationKeyPrefix}.form.date.placeholder`,
                'Select transaction date',
              )}
              value={formatDateForInput(field.value)}
              onChange={(event) => {
                const parsedDate = parseDateInput(event.target.value);
                field.onChange(parsedDate ?? new Date());
              }}
              onBlur={field.onBlur}
              name={field.name}
            />
            {errors.date?.message ? (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            ) : null}
          </div>
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
              field.onChange(selectedCategoryValue.id ?? null);
            }}
            error={errors.categoryId?.message}
          />
        )}
      />
    </div>
  );
}
