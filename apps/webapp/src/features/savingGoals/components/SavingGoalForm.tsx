import { SavingGoalDto } from '@guallet/api-client/src/savingGoals';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAccounts, useSavingGoalMutations } from '@guallet/api-react';
import {
  Button,
  MultiSelect,
  Card,
  Group,
  NumberInput,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@/lib/notifications';
import { IconPigMoney, IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

interface SavingGoalFormProps {
  savingGoal?: SavingGoalDto;
  onSuccess?: (goal: SavingGoalDto) => void;
  onCancel?: () => void;
}

const savingGoalFormSchema = z.object({
  name: z.string().trim().min(1, { error: 'Name is required' }),
  description: z.string(),
  target_amount: z
    .number()
    .gt(0, { error: 'Target amount must be greater than 0' }),
  target_date: z.date().refine(
    (value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return value >= today;
    },
    {
      error: 'Target date cannot be in the past',
    },
  ),
  accounts: z.array(z.string()),
});

type SavingGoalFormData = z.infer<typeof savingGoalFormSchema>;

function getSavingGoalFormDefaultValues(
  savingGoal?: SavingGoalDto,
): SavingGoalFormData {
  return {
    name: savingGoal?.name || '',
    description: savingGoal?.description || '',
    target_amount: savingGoal?.target_amount || 0,
    target_date: savingGoal?.target_date
      ? new Date(savingGoal.target_date)
      : new Date(),
    accounts: savingGoal?.accounts || [],
  };
}

export function SavingGoalForm({
  savingGoal,
  onSuccess,
  onCancel,
}: Readonly<SavingGoalFormProps>) {
  const { accounts } = useAccounts();
  const { createSavingGoalMutation, updateSavingGoalMutation } =
    useSavingGoalMutations();

  const isEditing = !!savingGoal;

  const form = useForm<SavingGoalFormData>({
    resolver: zodResolver(savingGoalFormSchema),
    defaultValues: getSavingGoalFormDefaultValues(savingGoal),
  });
  const {
    control,
    formState: { errors },
  } = form;

  useEffect(() => {
    form.reset(getSavingGoalFormDefaultValues(savingGoal));
  }, [form, savingGoal]);

  const accountOptions = accounts.map((account) => ({
    value: account.id,
    label: `${account.name} (${account.sourceName || account.source || 'Manual'})`,
  }));

  const handleSubmit = async (values: SavingGoalFormData) => {
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
          title: 'Success',
          message: 'Saving goal updated successfully',
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
          title: 'Success',
          message: 'Saving goal created successfully',
          color: 'green',
        });
      }

      onSuccess?.(result);
    } catch (error) {
      console.error('Failed to save saving goal:', error);
      notifications.show({
        title: 'Error',
        message: `Failed to ${isEditing ? 'update' : 'create'} saving goal`,
        color: 'red',
      });
    }
  };

  const isSubmitting =
    createSavingGoalMutation.isPending || updateSavingGoalMutation.isPending;

  return (
    <Card withBorder shadow="sm" radius="lg" p="lg">
      <Stack gap="md">
        <Group>
          <IconPigMoney size={24} />
          <Text size="xl" fw={700}>
            {isEditing ? 'Edit Saving Goal' : 'Create New Saving Goal'}
          </Text>
        </Group>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Stack gap="md">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextInput
                  label="Goal Name"
                  placeholder="e.g., Emergency Fund, Vacation, New Car"
                  required
                  value={field.value}
                  onChange={(event) => {
                    field.onChange(event.currentTarget.value);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  label="Description"
                  placeholder="Optional description of your saving goal"
                  rows={3}
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
              name="target_amount"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Target Amount"
                  placeholder="Enter target amount"
                  required
                  min={0}
                  step={0.01}
                  thousandSeparator=","
                  decimalScale={2}
                  value={field.value}
                  onChange={(value) => {
                    const parsedValue =
                      typeof value === 'number' ? value : Number(value || 0);
                    field.onChange(Number.isNaN(parsedValue) ? 0 : parsedValue);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  error={errors.target_amount?.message}
                />
              )}
            />

            <Controller
              name="target_date"
              control={control}
              render={({ field }) => (
                <DateInput
                  label="Target Date"
                  placeholder="When do you want to reach this goal?"
                  required
                  minDate={new Date()}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value ?? new Date());
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  error={errors.target_date?.message}
                />
              )}
            />

            <Controller
              name="accounts"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  label="Linked Accounts"
                  placeholder="Select accounts to track for this goal"
                  data={accountOptions}
                  searchable
                  clearable
                  description="Select accounts that contribute to this saving goal. Progress will be calculated based on the balance of these accounts."
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.accounts?.message}
                />
              )}
            />

            <Group justify="flex-end" gap="sm">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  leftSection={<IconX size={16} />}
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                leftSection={<IconDeviceFloppy size={16} />}
                loading={isSubmitting}
              >
                {isEditing ? 'Update Goal' : 'Create Goal'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Card>
  );
}
