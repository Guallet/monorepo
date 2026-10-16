import { GualletColorPicker } from '@/components/GualletColorPicker/GualletColorPicker';
import { IconPicker } from '@/components/IconPicker/IconPicker';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { CategoryPicker } from '@/features/categories/components/CategoryPicker/CategoryPicker';
import { useLocale } from '@/i18n/useLocale';
import { CategoryDto } from '@guallet/api-client';
import {
  useAccounts,
  useBudget,
  useBudgetMutations,
  useCategories,
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

interface EditBudgetScreenProps {
  budgetId: string;
}

export function EditBudgetScreen({
  budgetId,
}: Readonly<EditBudgetScreenProps>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accounts } = useAccounts();
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const { budget, isLoading: isBudgetLoading } = useBudget(budgetId);
  const { updateBudgetMutation } = useBudgetMutations();

  if (isBudgetLoading || isCategoriesLoading) {
    return <BaseScreen isLoading />;
  }

  if (!budget) {
    return (
      <BaseScreen>
        <Box>{t('screens.budgets.edit.notFound', 'Budget not found.')}</Box>
      </BaseScreen>
    );
  }

  return (
    <EditBudgetForm
      key={budget.id}
      budget={budget}
      categories={categories}
      currencies={[
        ...accounts.map((account) => account.currency),
        budget.currency,
      ]}
      onCancel={() =>
        navigate({ to: '/budgets/$id', params: { id: budgetId } })
      }
      onSave={(values) => {
        updateBudgetMutation.mutate(
          {
            id: budgetId,
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
                message: t(
                  'screens.budgets.edit.notifications.success',
                  'Budget updated successfully.',
                ),
                color: 'green',
              });
              navigate({ to: '/budgets/$id', params: { id: budgetId } });
            },
            onError: (error) => {
              notifications.show({
                title: t(
                  'screens.budgets.edit.notifications.error.title',
                  'Could not update budget',
                ),
                message: error.message,
                color: 'red',
              });
            },
          },
        );
      }}
      isSaving={updateBudgetMutation.isPending}
    />
  );
}

interface EditBudgetFormProps {
  budget: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    colour?: string;
    icon?: string;
    categories: string[];
  };
  categories: CategoryDto[];
  currencies: string[];
  onCancel: () => void;
  onSave: (values: EditBudgetValues) => void;
  isSaving: boolean;
}

interface EditBudgetValues {
  name: string;
  amount: number;
  currency: string;
  colour: string;
  icon: string;
  categories: CategoryDto[];
}

function EditBudgetForm({
  budget,
  categories,
  currencies,
  onCancel,
  onSave,
  isSaving,
}: Readonly<EditBudgetFormProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const { locale } = useLocale();
  const form = useForm<EditBudgetValues>({
    mode: 'uncontrolled',
    initialValues: {
      name: budget.name,
      amount: budget.amount,
      currency: budget.currency,
      colour: budget.colour ?? '',
      icon: budget.icon ?? '',
      categories: categories.filter((category) =>
        budget.categories.includes(category.id),
      ),
    },
    validate: {
      name: (value) =>
        value.trim().length < 2
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
      categories: (value) =>
        value.length > 0
          ? null
          : t(
              'screens.budgets.create.form.categories.error',
              'Select at least one category',
            ),
    },
  });

  const currencyOptions = useMemo(
    () =>
      [...new Set(currencies)]
        .map((code) => Currency.fromISOCode(code, locale))
        .map((currency) => ({
          value: currency.code,
          label: `${currency.symbol} - ${currency.name} - ${currency.code}`,
        })),
    [currencies, locale],
  );

  const decimalPlaces = Currency.fromISOCode(
    form.values.currency,
  ).decimalPlaces;

  return (
    <BaseScreen title={t('screens.budgets.edit.title', 'Edit budget')}>
      <Box maw={560} mx="auto">
        <form onSubmit={form.onSubmit(onSave)}>
          <Stack gap={spacing.md}>
            <Card
              withBorder
              shadow="sm"
              radius="lg"
              p={{ base: 'md', sm: 'lg' }}
            >
              <Stack gap={spacing.md}>
                <TextInput
                  required
                  label={t('screens.budgets.create.form.name.label', 'Name')}
                  {...form.getInputProps('name')}
                />
                <Select
                  required
                  label={t(
                    'screens.budgets.create.form.currency.label',
                    'Currency',
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
                  decimalScale={decimalPlaces}
                  {...form.getInputProps('amount')}
                />
                <GualletColorPicker
                  label={t(
                    'screens.budgets.create.form.colorPicker.label',
                    'Colour',
                  )}
                  value={form.values.colour}
                  onColourSelected={(colour) =>
                    form.setFieldValue('colour', colour)
                  }
                />
                <IconPicker
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
                  onSelectionChanged={(selectedCategories) =>
                    form.setFieldValue('categories', selectedCategories)
                  }
                />
              </Stack>
            </Card>

            <Stack gap="xs" hiddenFrom="sm">
              <Button type="submit" fullWidth loading={isSaving}>
                {t('screens.budgets.edit.save', 'Save changes')}
              </Button>
              <Button variant="outline" fullWidth onClick={onCancel}>
                {t('screens.budgets.create.form.cancelButton.label', 'Cancel')}
              </Button>
            </Stack>
            <Group justify="flex-end" gap="xs" visibleFrom="sm">
              <Button variant="outline" onClick={onCancel}>
                {t('screens.budgets.create.form.cancelButton.label', 'Cancel')}
              </Button>
              <Button type="submit" loading={isSaving}>
                {t('screens.budgets.edit.save', 'Save changes')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Box>
    </BaseScreen>
  );
}
