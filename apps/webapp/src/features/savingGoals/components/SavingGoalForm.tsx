import { SavingGoalDto } from '@guallet/api-client/src/savingGoals';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAccounts, useSavingGoalMutations } from '@guallet/api-react';
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

function toggleAccountSelection(
  selectedValues: string[],
  accountId: string,
  shouldBeSelected: boolean,
): string[] {
  if (shouldBeSelected) {
    if (selectedValues.includes(accountId)) {
      return selectedValues;
    }

    return [...selectedValues, accountId];
  }

  return selectedValues.filter((currentAccountId) => currentAccountId !== accountId);
}

function getSubmitButtonLabel(
  isEditing: boolean,
  isSubmitting: boolean,
): string {
  if (isEditing) {
    return isSubmitting ? 'Updating Goal...' : 'Update Goal';
  }

  return isSubmitting ? 'Creating Goal...' : 'Create Goal';
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
  const minimumTargetDate = formatDateForInput(new Date());
  const submitButtonLabel = getSubmitButtonLabel(isEditing, isSubmitting);

  return (
    <Card className="rounded-lg border p-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <IconPigMoney className="h-6 w-6" />
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Edit Saving Goal' : 'Create New Saving Goal'}
          </h2>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-4">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <div className="grid gap-2">
                  <Label htmlFor="saving-goal-name">Goal Name</Label>
                  <Input
                    id="saving-goal-name"
                    placeholder="e.g., Emergency Fund, Vacation, New Car"
                    required
                    value={field.value}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                  {errors.name?.message ? (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <div className="grid gap-2">
                  <Label htmlFor="saving-goal-description">Description</Label>
                  <textarea
                    id="saving-goal-description"
                    placeholder="Optional description of your saving goal"
                    rows={3}
                    className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
              name="target_amount"
              control={control}
              render={({ field }) => (
                <div className="grid gap-2">
                  <Label htmlFor="saving-goal-target-amount">
                    Target Amount
                  </Label>
                  <Input
                    id="saving-goal-target-amount"
                    type="number"
                    placeholder="Enter target amount"
                    required
                    min={0}
                    step={0.01}
                    value={field.value}
                    onChange={(event) => {
                      const parsedValue = Number(event.target.value);
                      field.onChange(Number.isNaN(parsedValue) ? 0 : parsedValue);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                  {errors.target_amount?.message ? (
                    <p className="text-sm text-destructive">
                      {errors.target_amount.message}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <Controller
              name="target_date"
              control={control}
              render={({ field }) => (
                <div className="grid gap-2">
                  <Label htmlFor="saving-goal-target-date">Target Date</Label>
                  <Input
                    id="saving-goal-target-date"
                    type="date"
                    placeholder="When do you want to reach this goal?"
                    required
                    min={minimumTargetDate}
                    value={formatDateForInput(field.value)}
                    onChange={(event) => {
                      const parsedDate = parseDateInput(event.target.value);
                      field.onChange(parsedDate ?? new Date());
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                  {errors.target_date?.message ? (
                    <p className="text-sm text-destructive">
                      {errors.target_date.message}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <Controller
              name="accounts"
              control={control}
              render={({ field }) => (
                <div className="grid gap-2">
                  <Label>Linked Accounts</Label>
                  <p className="text-sm text-muted-foreground">
                    Select accounts that contribute to this saving goal. Progress will be calculated based on the balance of these accounts.
                  </p>
                  <div className="max-h-56 overflow-y-auto rounded-md border">
                    {accountOptions.length === 0 ? (
                      <p className="p-3 text-sm text-muted-foreground">
                        No accounts available.
                      </p>
                    ) : (
                      accountOptions.map((option) => {
                        const selectedValues = field.value ?? [];
                        const isChecked = selectedValues.includes(option.value);

                        return (
                          <label
                            key={option.value}
                            className="flex cursor-pointer items-center gap-2 border-b px-3 py-2 text-sm last:border-b-0 hover:bg-accent/40"
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                field.onChange(
                                  toggleAccountSelection(
                                    selectedValues,
                                    option.value,
                                    checked === true,
                                  ),
                                );
                              }}
                            />
                            <span>{option.label}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                  {errors.accounts?.message ? (
                    <p className="text-sm text-destructive">
                      {errors.accounts.message}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <div className="flex flex-wrap justify-end gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  <IconX className="h-4 w-4" />
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                <IconDeviceFloppy className="h-4 w-4" />
                {submitButtonLabel}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
}
