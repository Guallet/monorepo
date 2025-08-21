import { useAccounts, useBudgetMutations } from "@guallet/api-react";
import { useForm } from "@mantine/form";
import {
  TextInput,
  NumberInput,
  Select,
  Button,
  Stack,
  Group,
} from "@mantine/core";
import { GualletColorPicker } from "@/components/GualletColorPicker/GualletColorPicker";
import { Currency } from "@guallet/money";
import { AppSection } from "@/components/Cards/AppSection";
import { BaseScreen } from "@/components/Screens/BaseScreen";
import { useLocale } from "@/i18n/useLocale";
import { CategoryMultiSelect } from "@/features/categories/components/CategoryMultiSelect/CategoryMultiSelect";
import { useMemo } from "react";
import { CategoryDto } from "@guallet/api-client";

export function CreateBudgetScreen() {
  const { createBudgetMutation } = useBudgetMutations();
  const { locale } = useLocale();
  const { accounts } = useAccounts();

  const form = useForm({
    initialValues: {
      name: "",
      amount: 0,
      currency: "USD", // TODO: Use the default one from the user settings
      colour: "",
      icon: "",
      categories: [] as CategoryDto[],
    },
    // TODO: Validate using Zod
    validate: {
      name: (value) => (value.length < 2 ? "Name is too short" : null),
      amount: (value) => (value <= 0 ? "Amount must be positive" : null),
      currency: (value) => (!value ? "Currency is required" : null),
      categories: (value: CategoryDto[]) =>
        value.length === 0 ? "Select at least one category" : null,
    },
  });

  // Only available currencies from the existing accounts
  // TODO: Create a hook to get the user currencies. The default one and the ones used by their accounts
  const availableCurrencies = useMemo(
    () =>
      accounts
        .map((account) => account.currency)
        // remove duplicates
        .filter(
          (currencyCode, index, self) => self.indexOf(currencyCode) === index
        )
        .map((currencyCode) => Currency.fromISOCode(currencyCode, locale)),
    [accounts, locale]
  );

  const currencyOptions = useMemo(
    () =>
      availableCurrencies.map((currency) => ({
        value: currency.code,
        label: `${currency.symbol} - ${currency.name} - ${currency.code}`,
      })),
    [availableCurrencies]
  );

  const handleSubmit = (values: typeof form.values) => {
    createBudgetMutation.mutate({
      request: {
        name: values.name,
        amount: values.amount,
        currency: values.currency,
        colour: values.colour || undefined,
        icon: values.icon || undefined,
        categories: values.categories.map((category) => category.id),
      },
    });
  };

  console.log("Rendering <CreateBudgetScreen />");
  return (
    <BaseScreen>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <AppSection title="Create new Budget">
            <TextInput
              label="Name"
              placeholder="Budget name"
              {...form.getInputProps("name")}
              required
            />
            <Select
              label="Currency"
              description="Only available currencies from your existing accounts are shown."
              placeholder="Select currency"
              data={currencyOptions}
              {...form.getInputProps("currency")}
              required
            />
            <NumberInput
              label="Budget Amount"
              min={0}
              {...form.getInputProps("amount")}
              required
            />
            <GualletColorPicker
              label="Color"
              placeholder="#FF0000"
              {...form.getInputProps("colour")}
            />
            <TextInput
              label="Icon"
              placeholder="icon-name"
              {...form.getInputProps("icon")}
            />
            <CategoryMultiSelect
              required
              label="Categories"
              selectedCategories={form.values.categories}
              onSelectionChanged={(categories: CategoryDto[]) => {
                console.log("Selected categories:", categories);
                form.setFieldValue("categories", categories);
              }}
            />
          </AppSection>
          <Group justify="flex-end" mt="md">
            <Button
              type="submit"
              loading={createBudgetMutation.status === "pending"}
            >
              Create Budget
            </Button>
          </Group>
          {createBudgetMutation.status === "error" && (
            <div style={{ color: "red" }}>
              Error: {createBudgetMutation.error?.message}
            </div>
          )}
          {createBudgetMutation.status === "success" && (
            <div style={{ color: "green" }}>Budget created!</div>
          )}
        </Stack>
      </form>
    </BaseScreen>
  );
}
