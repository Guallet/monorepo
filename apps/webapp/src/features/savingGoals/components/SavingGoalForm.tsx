import {
  CreateSavingGoalRequest,
  UpdateSavingGoalRequest,
  SavingGoalDto,
} from "@guallet/api-client/src/savingGoals";
import { useAccounts, useSavingGoalMutations } from "@guallet/api-react";
import {
  Stack,
  TextInput,
  Textarea,
  NumberInput,
  Button,
  Group,
  MultiSelect,
  Card,
  Text,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconPigMoney, IconDeviceFloppy, IconX } from "@tabler/icons-react";

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
  const { accounts } = useAccounts();
  const { createSavingGoalMutation, updateSavingGoalMutation } =
    useSavingGoalMutations();

  const isEditing = !!savingGoal;

  const form = useForm<FormValues>({
    initialValues: {
      name: savingGoal?.name || "",
      description: savingGoal?.description || "",
      target_amount: savingGoal?.target_amount || 0,
      target_date: savingGoal?.target_date
        ? new Date(savingGoal.target_date)
        : new Date(),
      accounts: savingGoal?.accounts || [],
    },
    validate: {
      name: (value) => (!value.trim() ? "Name is required" : null),
      target_amount: (value) =>
        value <= 0 ? "Target amount must be greater than 0" : null,
      target_date: (value) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (value < today) {
          return "Target date cannot be in the past";
        }
        return null;
      },
    },
  });

  const accountOptions = accounts.map((account) => ({
    value: account.id,
    label: `${account.name} (${account.sourceName || account.source || "Manual"})`,
  }));

  const handleSubmit = async (values: FormValues) => {
    try {
      const requestData = {
        name: values.name,
        description: values.description || undefined,
        target_amount: values.target_amount,
        target_date: values.target_date,
        accounts: values.accounts,
      };

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
          title: "Success",
          message: "Saving goal updated successfully",
          color: "green",
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
          title: "Success",
          message: "Saving goal created successfully",
          color: "green",
        });
      }

      onSuccess?.(result);
    } catch (error) {
      console.error("Failed to save saving goal:", error);
      notifications.show({
        title: "Error",
        message: `Failed to ${isEditing ? "update" : "create"} saving goal`,
        color: "red",
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
            {isEditing ? "Edit Saving Goal" : "Create New Saving Goal"}
          </Text>
        </Group>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Goal Name"
              placeholder="e.g., Emergency Fund, Vacation, New Car"
              required
              {...form.getInputProps("name")}
            />

            <Textarea
              label="Description"
              placeholder="Optional description of your saving goal"
              rows={3}
              {...form.getInputProps("description")}
            />

            <NumberInput
              label="Target Amount"
              placeholder="Enter target amount"
              required
              min={0}
              step={0.01}
              //   prefix="$"
              thousandSeparator=","
              decimalScale={2}
              {...form.getInputProps("target_amount")}
            />

            <DateInput
              label="Target Date"
              placeholder="When do you want to reach this goal?"
              required
              minDate={new Date()}
              {...form.getInputProps("target_date")}
            />

            <MultiSelect
              label="Linked Accounts"
              placeholder="Select accounts to track for this goal"
              data={accountOptions}
              searchable
              clearable
              description="Select accounts that contribute to this saving goal. Progress will be calculated based on the balance of these accounts."
              {...form.getInputProps("accounts")}
            />

            <Group justify="flex-end" gap="sm">
              {onCancel && (
                <Button
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
                {isEditing ? "Update Goal" : "Create Goal"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Card>
  );
}
