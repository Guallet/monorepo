import {
  CreateRecurringPaymentRequest,
  RecurringPaymentType,
  RecurrenceCadence,
} from "@guallet/api-client/src/recurringPayments";
import {
  useRecurringPaymentMutations,
  useCategories,
  useSuggestedTransactions,
} from "@guallet/api-react";
import {
  Stack,
  TextInput,
  NumberInput,
  Button,
  Group,
  Select,
  Card,
  Text,
  Title,
  Paper,
  Divider,
  Loader,
  Center,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconDeviceFloppy,
  IconX,
  IconRepeat,
  IconSparkles,
} from "@tabler/icons-react";
import { DetectedRecurringPaymentDto } from "@guallet/api-client/src/recurringPayments";

interface RecurringPaymentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormValues {
  type: RecurringPaymentType;
  name: string;
  amount: number;
  currency: string;
  cadence: RecurrenceCadence;
  nextDate: Date;
  imageUrl: string;
  categoryId: string;
}

export function RecurringPaymentForm({
  onSuccess,
  onCancel,
}: Readonly<RecurringPaymentFormProps>) {
  const { categories } = useCategories();
  const { suggestedTransactions, isLoading: isSuggestionsLoading } =
    useSuggestedTransactions();
  const { createRecurringPaymentMutation } = useRecurringPaymentMutations();

  const form = useForm<FormValues>({
    initialValues: {
      type: RecurringPaymentType.SUBSCRIPTION,
      name: "",
      amount: 0,
      currency: "USD",
      cadence: RecurrenceCadence.MONTHLY,
      nextDate: new Date(),
      imageUrl: "",
      categoryId: "",
    },
    validate: {
      name: (value) => (!value.trim() ? "Name is required" : null),
      amount: (value) =>
        value <= 0 ? "Amount must be greater than 0" : null,
      nextDate: (value) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (value < today) {
          return "Next payment date cannot be in the past";
        }
        return null;
      },
    },
  });

  const categoryOptions = [
    { value: "", label: "No Category" },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ];

  const typeOptions = [
    {
      value: RecurringPaymentType.SUBSCRIPTION,
      label: "Subscription",
    },
    {
      value: RecurringPaymentType.REGULAR_PAYMENT,
      label: "Regular Payment",
    },
    {
      value: RecurringPaymentType.REGULAR_INCOME,
      label: "Regular Income",
    },
  ];

  const cadenceOptions = [
    { value: RecurrenceCadence.WEEKLY, label: "Weekly" },
    { value: RecurrenceCadence.BIWEEKLY, label: "Bi-weekly" },
    { value: RecurrenceCadence.MONTHLY, label: "Monthly" },
    { value: RecurrenceCadence.QUARTERLY, label: "Quarterly" },
    { value: RecurrenceCadence.YEARLY, label: "Yearly" },
  ];

  const handleSubmit = async (values: FormValues) => {
    try {
      const requestData: CreateRecurringPaymentRequest = {
        type: values.type,
        name: values.name,
        amount: values.amount,
        currency: values.currency,
        cadence: values.cadence,
        nextDate: values.nextDate,
        imageUrl: values.imageUrl || undefined,
        categoryId: values.categoryId || undefined,
      };

      await createRecurringPaymentMutation.mutateAsync({
        request: requestData,
      });

      notifications.show({
        title: "Success",
        message: "Recurring payment created successfully",
        color: "green",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Failed to create recurring payment:", error);
      notifications.show({
        title: "Error",
        message: "Failed to create recurring payment",
        color: "red",
      });
    }
  };

  const handleUseSuggestion = (suggestion: DetectedRecurringPaymentDto) => {
    form.setValues({
      type: RecurringPaymentType.REGULAR_PAYMENT,
      name: suggestion.description,
      amount: suggestion.averageAmount,
      currency: suggestion.currency,
      cadence: suggestion.suggestedCadence,
      nextDate: new Date(suggestion.nextExpectedDate),
      imageUrl: "",
      categoryId: suggestion.categoryId || "",
    });
  };

  return (
    <Stack gap="lg">
      {/* Suggested Transactions Section */}
      {isSuggestionsLoading ? (
        <Center>
          <Loader />
        </Center>
      ) : suggestedTransactions.length > 0 ? (
        <Paper withBorder p="md">
          <Group mb="md">
            <IconSparkles size={20} />
            <Title order={4}>Suggested Recurring Payments</Title>
          </Group>
          <Text size="sm" c="dimmed" mb="md">
            We detected these potential recurring payments from your
            transactions. Click one to prefill the form.
          </Text>
          <Stack gap="xs">
            {suggestedTransactions.slice(0, 5).map((suggestion, index) => (
              <Card
                key={index}
                withBorder
                p="sm"
                style={{ cursor: "pointer" }}
                onClick={() => handleUseSuggestion(suggestion)}
              >
                <Group justify="space-between">
                  <Stack gap={0}>
                    <Text size="sm" fw={500}>
                      {suggestion.description}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {suggestion.occurrenceCount} occurrences •{" "}
                      {suggestion.suggestedCadence}
                    </Text>
                  </Stack>
                  <Text size="sm" fw={600}>
                    ${suggestion.averageAmount.toFixed(2)}
                  </Text>
                </Group>
              </Card>
            ))}
          </Stack>
        </Paper>
      ) : null}

      <Divider label="OR CREATE MANUALLY" labelPosition="center" />

      {/* Manual Form */}
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Select
            label="Type"
            placeholder="Select type"
            data={typeOptions}
            required
            {...form.getInputProps("type")}
          />

          <TextInput
            label="Name"
            placeholder="e.g., Netflix, Spotify, Salary"
            required
            leftSection={<IconRepeat size={16} />}
            {...form.getInputProps("name")}
          />

          <NumberInput
            label="Amount"
            placeholder="0.00"
            required
            min={0}
            decimalScale={2}
            {...form.getInputProps("amount")}
          />

          <Select
            label="Cadence"
            placeholder="Select frequency"
            data={cadenceOptions}
            required
            {...form.getInputProps("cadence")}
          />

          <DateInput
            label="Next Payment Date"
            placeholder="Select date"
            required
            {...form.getInputProps("nextDate")}
          />

          <Select
            label="Category"
            placeholder="Select category"
            data={categoryOptions}
            searchable
            clearable
            {...form.getInputProps("categoryId")}
          />

          {form.values.type === RecurringPaymentType.SUBSCRIPTION && (
            <TextInput
              label="Logo URL (optional)"
              placeholder="https://example.com/logo.png"
              description="Add a logo URL to display for this subscription"
              {...form.getInputProps("imageUrl")}
            />
          )}

          <Group justify="flex-end" mt="md">
            {onCancel && (
              <Button
                variant="outline"
                leftSection={<IconX size={16} />}
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              leftSection={<IconDeviceFloppy size={16} />}
              loading={createRecurringPaymentMutation.isPending}
            >
              Create Recurring Payment
            </Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
}
