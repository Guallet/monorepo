import { GualletColorPicker } from '@/components/GualletColorPicker/GualletColorPicker';
import { IconPicker } from '@/components/IconPicker/IconPicker';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { CategoryPicker } from '@/features/categories/components/CategoryPicker/CategoryPicker';
import { useLocale } from '@/i18n/useLocale';
import { CategoryDto } from '@guallet/api-client';
import {
  useAccounts,
  useBudgetMutations,
  useUserSettings,
} from '@guallet/api-react';
import { Currency } from '@guallet/money';
import { useTheme } from '@guallet/ui-react';
import {
  Box,
  Button,
  Card,
  Group,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function CreateBudgetScreen() {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const { createBudgetMutation } = useBudgetMutations();
  const { locale } = useLocale();
  const { accounts } = useAccounts();
  const navigate = useNavigate();
  const { settings } = useUserSettings();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      amount: 0,
      currency: settings?.currencies.default_currency,
      colour: '',
      icon: '',
      categories: [] as CategoryDto[],
    },
    validate: {
      name: (value) =>
        value.length < 2
          ? t('screens.budgets.create.form.name.error', 'Name is too short')
          : null,
      amount: (value) =>
        value <= 0
          ? t(
              'screens.budgets.create.form.amount.error',
              'Amount must be positive',
            )
          : null,
      currency: (value) =>
        value
          ? null
          : t(
              'screens.budgets.create.form.currency.error',
              'Currency is required',
            ),
      colour: (value) =>
        value
          ? null
          : t(
              'screens.budgets.create.form.colorPicker.error',
              'Colour is required',
            ),
      categories: (value: CategoryDto[]) =>
        value.length === 0
          ? t(
              'screens.budgets.create.form.categories.error',
              'Select at least one category',
            )
          : null,
    },
  });

  const availableCurrencies = useMemo(
    () =>
      accounts
        .map((account) => account.currency)
        .filter((code, index, self) => self.indexOf(code) === index)
        .map((code) => Currency.fromISOCode(code, locale)),
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

  const handleSubmit = (values: typeof form.values) => {
    createBudgetMutation.mutate(
      {
        request: {
          name: values.name,
          amount: values.amount,
          currency: values.currency,
          colour: values.colour || undefined,
          icon: values.icon || undefined,
          categories: values.categories.map((c) => c.id),
        },
      },
      {
        onSuccess: () => {
          notifications.show({
            message: t(
              'screens.budgets.create.notifications.success.message',
              'Budget created successfully.',
            ),
            color: 'green',
          });
          navigate({ to: '/budgets' });
        },
        onError: (error) => {
          notifications.show({
            title: t(
              'screens.budgets.create.notifications.error.title',
              'Could not create budget',
            ),
            message: error.message,
            color: 'red',
          });
        },
      },
    );
  };

  return (
    <BaseScreen title={t('screens.budgets.create.title', 'New budget')}>
      <Box maw={560} mx="auto">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap={spacing.md}>
            <Card
              withBorder
              shadow="sm"
              radius="lg"
              padding={{ base: 'md', sm: 'lg' }}
            >
              <Stack gap={spacing.md}>
                <TextInput
                  required
                  label={t('screens.budgets.create.form.name.label', 'Name')}
                  placeholder={t(
                    'screens.budgets.create.form.name.placeholder',
                    'Budget name',
                  )}
                  {...form.getInputProps('name')}
                />
                <Select
                  required
                  label={t(
                    'screens.budgets.create.form.currency.label',
                    'Currency',
                  )}
                  description={t(
                    'screens.budgets.create.form.currency.description',
                    'Only currencies from your existing accounts are shown.',
                  )}
                  placeholder={t(
                    'screens.budgets.create.form.currency.placeholder',
                    'Select currency',
                  )}
                  data={currencyOptions}
                  {...form.getInputProps('currency')}
                />
                <NumberInput
                  required
                  label={t(
                    'screens.budgets.create.form.amount.label',
                    'Budget amount',
                  )}
                  min={0}
                  {...form.getInputProps('amount')}
                />
                <GualletColorPicker
                  label={t(
                    'screens.budgets.create.form.colorPicker.label',
                    'Color',
                  )}
                  placeholder={t(
                    'screens.budgets.create.form.colorPicker.placeholder',
                    'Select a color',
                  )}
                  value={form.values.colour}
                  onColourSelected={(colour: string) => {
                    form.setFieldValue('colour', colour);
                  }}
                />
                <IconPicker
                  {...form.getInputProps('icon')}
                  name="icon"
                  required
                  label={t('screens.budgets.create.form.icon.label', 'Icon')}
                  description={t(
                    'screens.budgets.create.form.icon.description',
                    'Select an icon for the budget',
                  )}
                  value={form.values.icon}
                  onValueChanged={(iconName) =>
                    form.setFieldValue('icon', iconName ?? '')
                  }
                />
                <CategoryPicker
                  mode="multiple"
                  required
                  label={t(
                    'screens.budgets.create.form.categories.label',
                    'Categories',
                  )}
                  selectedCategories={form.values.categories}
                  onSelectionChanged={(categories: CategoryDto[]) => {
                    form.setFieldValue('categories', categories);
                  }}
                />
              </Stack>
            </Card>

            <Stack gap="xs" hiddenFrom="sm">
              <Button
                type="submit"
                fullWidth
                size="md"
                loading={createBudgetMutation.isPending}
              >
                {t(
                  'screens.budgets.create.form.submitButton.label',
                  'Create budget',
                )}
              </Button>
              <Button
                variant="outline"
                fullWidth
                size="md"
                onClick={() => navigate({ to: '/budgets' })}
              >
                {t('screens.budgets.create.form.cancelButton.label', 'Cancel')}
              </Button>
            </Stack>
            <Group justify="flex-end" gap="xs" visibleFrom="sm">
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/budgets' })}
              >
                {t('screens.budgets.create.form.cancelButton.label', 'Cancel')}
              </Button>
              <Button type="submit" loading={createBudgetMutation.isPending}>
                {t(
                  'screens.budgets.create.form.submitButton.label',
                  'Create budget',
                )}
              </Button>
            </Group>
          </Stack>
        </form>
      </Box>
    </BaseScreen>
  );
}
