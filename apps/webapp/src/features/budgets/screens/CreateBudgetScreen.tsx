import {
  useAccounts,
  useBudgetMutations,
  useUserSettings,
} from '@guallet/api-react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Group,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { GualletColorPicker } from '@/components/GualletColorPicker/GualletColorPicker';
import { Currency } from '@guallet/money';
import { AppSection } from '@/components/Cards/AppSection';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useLocale } from '@/i18n/useLocale';
import { CategoryMultiSelect } from '@/features/categories/components/CategoryMultiSelect/CategoryMultiSelect';
import { useMemo } from 'react';
import { CategoryDto } from '@guallet/api-client';
import { notifications } from '@/lib/notifications';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { IconPicker } from '@/components/IconPicker/IconPicker';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const createBudgetFormSchema = z.object({
  name: z.string().min(2, { error: 'Name is too short' }),
  amount: z.number().gt(0, { error: 'Amount must be positive' }),
  currency: z.string().min(1, { error: 'Currency is required' }),
  colour: z.string().min(1, { error: 'Colour is required' }),
  icon: z.string(),
  categories: z
    .array(z.custom<CategoryDto>())
    .min(1, { error: 'Select at least one category' }),
});

type CreateBudgetFormData = z.infer<typeof createBudgetFormSchema>;

export function CreateBudgetScreen() {
  const { createBudgetMutation } = useBudgetMutations();
  const { locale } = useLocale();
  const { accounts } = useAccounts();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings } = useUserSettings();

  const form = useForm<CreateBudgetFormData>({
    resolver: zodResolver(createBudgetFormSchema),
    defaultValues: {
      name: '',
      amount: 0,
      currency: settings?.currencies.default_currency ?? '',
      colour: '',
      icon: '',
      categories: [],
    },
  });
  const {
    control,
    formState: { errors },
  } = form;

  // Only available currencies from the existing accounts
  // TODO: Create a hook to get the user currencies. The default one and the ones used by their accounts
  const availableCurrencies = useMemo(
    () =>
      accounts
        .map((account) => account.currency)
        // remove duplicates
        .filter(
          (currencyCode, index, self) => self.indexOf(currencyCode) === index,
        )
        .map((currencyCode) => Currency.fromISOCode(currencyCode, locale)),
    [accounts, locale],
  );

  const currencyOptions = useMemo(
    () =>
      availableCurrencies.map((currency) => ({
        value: currency.code,
        label: `${currency.symbol} - ${currency.name} - ${currency.code}`,
      })),
    [availableCurrencies],
  );

  const handleSubmit = (values: CreateBudgetFormData) => {
    console.log('Submitting budget:', values);
    createBudgetMutation.mutate(
      {
        request: {
          name: values.name,
          amount: values.amount,
          currency: values.currency,
          colour: values.colour || undefined,
          icon: values.icon || undefined,
          categories: values.categories.map((category) => category.id),
        },
      },
      {
        onSuccess: () => {
          notifications.show({
            title: t(
              'screens.budgets.create.notifications.success.title',
              'Budget Created',
            ),
            message: t(
              'screens.budgets.create.notifications.success.message',
              `Your new budget has been created successfully.`,
            ),
            color: 'green',
          });
          navigate({ to: '/budgets' });
        },
        onError: (error) => {
          notifications.show({
            title: t(
              'screens.budgets.create.notifications.error.title',
              'Error Creating Budget',
            ),
            message: error.message,
            color: 'red',
          });
        },
      },
    );
  };

  return (
    <BaseScreen>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Stack>
          <AppSection
            title={t('screens.budgets.create.form.title', 'Create new Budget')}
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextInput
                  label={t('screens.budgets.create.form.name.label', 'Name')}
                  placeholder={t(
                    'screens.budgets.create.form.name.placeholder',
                    'Budget name',
                  )}
                  value={field.value}
                  onChange={(event) => {
                    field.onChange(event.currentTarget.value);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  error={errors.name?.message}
                  required
                />
              )}
            />
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <Select
                  label={t(
                    'screens.budgets.create.form.currency.label',
                    'Currency',
                  )}
                  description={t(
                    'screens.budgets.create.form.currency.description',
                    'Only available currencies from your existing accounts are shown.',
                  )}
                  placeholder={t(
                    'screens.budgets.create.form.currency.placeholder',
                    'Select currency',
                  )}
                  data={currencyOptions}
                  value={field.value || null}
                  onChange={(value) => {
                    field.onChange(value ?? '');
                  }}
                  error={errors.currency?.message}
                  required
                />
              )}
            />
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label={t(
                    'screens.budgets.create.form.amount.label',
                    'Budget Amount',
                  )}
                  min={0}
                  value={field.value}
                  onChange={(value) => {
                    const parsedValue =
                      typeof value === 'number' ? value : Number(value || 0);
                    field.onChange(Number.isNaN(parsedValue) ? 0 : parsedValue);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  error={errors.amount?.message}
                  required
                />
              )}
            />
            <Controller
              name="colour"
              control={control}
              render={({ field }) => (
                <GualletColorPicker
                  label={t(
                    'screens.budgets.create.form.colorPicker.label',
                    'Color',
                  )}
                  placeholder={t(
                    'screens.budgets.create.form.colorPicker.placeholder',
                    'Select the category colour',
                  )}
                  value={field.value}
                  onColourSelected={(colour: string) => {
                    field.onChange(colour);
                  }}
                  error={errors.colour?.message}
                />
              )}
            />
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <IconPicker
                  name={field.name}
                  label={t('screens.budgets.create.form.icon.label', 'Icon')}
                  description={t(
                    'screens.budgets.create.form.icon.description',
                    'Select an icon for the budget',
                  )}
                  required
                  value={field.value}
                  onValueChanged={(iconName) => {
                    field.onChange(iconName ?? '');
                  }}
                  error={errors.icon?.message}
                />
              )}
            />
            <Controller
              name="categories"
              control={control}
              render={({ field }) => (
                <CategoryMultiSelect
                  required
                  label={t(
                    'screens.budgets.create.form.categories.label',
                    'Categories',
                  )}
                  selectedCategories={field.value}
                  onSelectionChanged={(categories: CategoryDto[]) => {
                    console.log('Selected categories:', categories);
                    field.onChange(categories);
                  }}
                  error={errors.categories?.message}
                />
              )}
            />
          </AppSection>
          <Group justify="flex-end" mt="md">
            <Button
              type="submit"
              loading={createBudgetMutation.status === 'pending'}
            >
              {t(
                'screens.budgets.create.form.submitButton.label',
                'Create Budget',
              )}
            </Button>
          </Group>
          {createBudgetMutation.status === 'error' && (
            <div style={{ color: 'red' }}>
              Error: {createBudgetMutation.error?.message}
            </div>
          )}
        </Stack>
      </form>
    </BaseScreen>
  );
}
