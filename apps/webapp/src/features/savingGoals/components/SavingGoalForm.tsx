import { SavingGoalDto } from '@guallet/api-client/src/savingGoals';
import { useAccounts, useSavingGoalMutations } from '@guallet/api-react';
import { Currency, Money } from '@guallet/money';
import { useTheme } from '@guallet/ui-react';
import {
  Box,
  Button,
  Card,
  Group,
  MultiSelect,
  NumberInput,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';

interface SavingGoalFormProps {
  savingGoal?: SavingGoalDto;
  onSuccess?: (goal: SavingGoalDto) => void;
  onCancel?: () => void;
}

interface FormValues {
  name: string;
  description: string;
  target_amount: number;
  target_date: Date;
  accounts: string[];
}

export function SavingGoalForm({
  savingGoal,
  onSuccess,
  onCancel,
}: Readonly<SavingGoalFormProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const { accounts } = useAccounts();
  const { createSavingGoalMutation, updateSavingGoalMutation } =
    useSavingGoalMutations();

  const isEditing = !!savingGoal;

  const form = useForm<FormValues>({
    initialValues: {
      name: savingGoal?.name ?? '',
      description: savingGoal?.description ?? '',
      target_amount: savingGoal?.targetAmount ?? 0,
      target_date: savingGoal?.targetDate
        ? new Date(savingGoal.targetDate)
        : new Date(),
      accounts: savingGoal?.accounts ?? [],
    },
    validate: {
      name: (value) =>
        value.trim() === ''
          ? t('screens.savingGoals.form.fields.name.error', 'Name is required')
          : null,
      target_amount: (value, values) => {
        if (!Number.isFinite(value) || value <= 0) {
          return t(
            'screens.savingGoals.form.fields.targetAmount.error',
            'Target amount must be greater than 0',
          );
        }
        const code = accounts.find((account) =>
          values.accounts.includes(account.id),
        )?.currency;
        if (!code) return null;
        try {
          const currency = Currency.fromISOCode(code);
          if (
            Money.from({ amount: value, currency }).round().amount !== value
          ) {
            return t('screens.savingGoals.form.fields.targetAmount.precision', {
              defaultValue:
                'Enter no more than {{precision}} decimal places for {{currency}}.',
              precision: currency.decimalPlaces,
              currency: code,
            });
          }
        } catch {
          return t(
            'screens.savingGoals.form.fields.accounts.unsupported',
            'Select accounts with a supported currency.',
          );
        }
        return null;
      },
      accounts: (ids) => {
        const selected = accounts.filter((account) => ids.includes(account.id));
        if (!ids.length || selected.length !== ids.length) {
          return t(
            'screens.savingGoals.form.fields.accounts.required',
            'Select at least one available account.',
          );
        }
        if (new Set(selected.map((account) => account.currency)).size !== 1) {
          return t(
            'screens.savingGoals.form.fields.accounts.currency',
            'Linked accounts must use the same currency.',
          );
        }
        return null;
      },
      target_date: (value) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return value < today
          ? t(
              'screens.savingGoals.form.fields.targetDate.error',
              'Target date cannot be in the past',
            )
          : null;
      },
    },
  });

  const selectedCurrency = accounts.find((account) =>
    form.values.accounts.includes(account.id),
  )?.currency;
  let decimalPlaces: number | undefined;
  if (selectedCurrency) {
    try {
      decimalPlaces = Currency.fromISOCode(selectedCurrency).decimalPlaces;
    } catch {
      // Validation explains unsupported saved currencies before submission.
    }
  }
  const accountOptions = accounts.map((account) => ({
    value: account.id,
    disabled:
      !!selectedCurrency &&
      account.currency !== selectedCurrency &&
      !form.values.accounts.includes(account.id),
    label: `${account.name} (${account.sourceName || account.source || 'Manual'})`,
  }));

  const handleSubmit = async (values: FormValues) => {
    try {
      let result: SavingGoalDto;
      if (isEditing && savingGoal) {
        result = await updateSavingGoalMutation.mutateAsync({
          id: savingGoal.id,
          request: {
            name: values.name,
            description: values.description || undefined,
            targetAmount: values.target_amount,
            targetDate: values.target_date,
            accounts: values.accounts,
          },
        });
        notifications.show({
          message: t(
            'screens.savingGoals.form.notifications.updated',
            'Saving goal updated successfully.',
          ),
          color: 'green',
        });
      } else {
        result = await createSavingGoalMutation.mutateAsync({
          request: {
            name: values.name,
            description: values.description || undefined,
            targetAmount: values.target_amount,
            targetDate: values.target_date,
            accounts: values.accounts,
          },
        });
        notifications.show({
          message: t(
            'screens.savingGoals.form.notifications.created',
            'Saving goal created successfully.',
          ),
          color: 'green',
        });
      }
      onSuccess?.(result);
    } catch (error) {
      console.error('Failed to save saving goal:', error);
      notifications.show({
        title: t('screens.savingGoals.form.notifications.error.title', 'Error'),
        message: t(
          'screens.savingGoals.form.notifications.error.message',
          'Failed to save the saving goal. Please try again.',
        ),
        color: 'red',
      });
    }
  };

  const isSubmitting =
    createSavingGoalMutation.isPending || updateSavingGoalMutation.isPending;

  return (
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
                label={t(
                  'screens.savingGoals.form.fields.name.label',
                  'Goal name',
                )}
                placeholder={t(
                  'screens.savingGoals.form.fields.name.placeholder',
                  'e.g. Emergency Fund, Vacation, New Car',
                )}
                {...form.getInputProps('name')}
              />
              <Textarea
                label={t(
                  'screens.savingGoals.form.fields.description.label',
                  'Description',
                )}
                placeholder={t(
                  'screens.savingGoals.form.fields.description.placeholder',
                  'Optional description of your saving goal',
                )}
                rows={3}
                {...form.getInputProps('description')}
              />
              <NumberInput
                required
                label={t(
                  'screens.savingGoals.form.fields.targetAmount.label',
                  'Target amount',
                )}
                placeholder={t(
                  'screens.savingGoals.form.fields.targetAmount.placeholder',
                  'Enter target amount',
                )}
                min={0}
                step={
                  decimalPlaces === undefined ? undefined : 10 ** -decimalPlaces
                }
                thousandSeparator=","
                decimalScale={decimalPlaces}
                {...form.getInputProps('target_amount')}
              />
              <DateInput
                required
                label={t(
                  'screens.savingGoals.form.fields.targetDate.label',
                  'Target date',
                )}
                placeholder={t(
                  'screens.savingGoals.form.fields.targetDate.placeholder',
                  'When do you want to reach this goal?',
                )}
                minDate={new Date()}
                {...form.getInputProps('target_date')}
              />
              <MultiSelect
                required
                label={t(
                  'screens.savingGoals.form.fields.accounts.label',
                  'Linked accounts',
                )}
                description={t(
                  'screens.savingGoals.form.fields.accounts.description',
                  'Progress is calculated from the balance of these accounts.',
                )}
                placeholder={t(
                  'screens.savingGoals.form.fields.accounts.placeholder',
                  'Select accounts',
                )}
                data={accountOptions}
                searchable
                clearable
                {...form.getInputProps('accounts')}
              />
            </Stack>
          </Card>

          <Stack gap="xs" hiddenFrom="sm">
            <Button type="submit" fullWidth size="md" loading={isSubmitting}>
              {isEditing
                ? t('screens.savingGoals.form.updateButton', 'Update goal')
                : t('screens.savingGoals.form.createButton', 'Create goal')}
            </Button>
            {onCancel && (
              <Button
                variant="outline"
                fullWidth
                size="md"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {t('screens.savingGoals.form.cancelButton', 'Cancel')}
              </Button>
            )}
          </Stack>
          <Group justify="flex-end" gap="xs" visibleFrom="sm">
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {t('screens.savingGoals.form.cancelButton', 'Cancel')}
              </Button>
            )}
            <Button type="submit" loading={isSubmitting}>
              {isEditing
                ? t('screens.savingGoals.form.updateButton', 'Update goal')
                : t('screens.savingGoals.form.createButton', 'Create goal')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}
