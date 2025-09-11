import {
  useAccounts,
  useBudgetMutations,
  useUserSettings,
} from "@guallet/api-react";
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
import { notifications } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { IconPicker } from "@/components/IconPicker/IconPicker";

export function CreateBudgetScreen() {
  const { createBudgetMutation } = useBudgetMutations();
  const { locale } = useLocale();
  const { accounts } = useAccounts();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings } = useUserSettings();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      amount: 0,
      currency: settings?.currencies.default_currency,
      colour: "",
      icon: "",
      categories: [] as CategoryDto[],
    },
    // TODO: Validate using Zod
    validate: {
      name: (value) => (value.length < 2 ? "Name is too short" : null),
      amount: (value) => (value <= 0 ? "Amount must be positive" : null),
      currency: (value) => (!value ? "Currency is required" : null),
      colour: (value) => (!value ? "Colour is required" : null),
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
    console.log("Submitting budget:", values);
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
        onSuccess: (data, variables, context) => {
          notifications.show({
            title: t(
              "screens.budgets.create.notifications.success.title",
              "Budget Created"
            ),
            message: t(
              "screens.budgets.create.notifications.success.message",
              `Your new budget has been created successfully.`
            ),
            color: "green",
          });
          navigate({ to: "/budgets" });
        },
        onError: (error, variables, context) => {
          notifications.show({
            title: t(
              "screens.budgets.create.notifications.error.title",
              "Error Creating Budget"
            ),
            message: error.message,
            color: "red",
          });
        },
      }
    );
  };

  return (
    <BaseScreen>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <AppSection
            title={t("screens.budgets.create.form.title", "Create new Budget")}
          >
            <TextInput
              label={t("screens.budgets.create.form.name.label", "Name")}
              placeholder={t(
                "screens.budgets.create.form.name.placeholder",
                "Budget name"
              )}
              {...form.getInputProps("name")}
              required
            />
            <Select
              label={t(
                "screens.budgets.create.form.currency.label",
                "Currency"
              )}
              description={t(
                "screens.budgets.create.form.currency.description",
                "Only available currencies from your existing accounts are shown."
              )}
              placeholder={t(
                "screens.budgets.create.form.currency.placeholder",
                "Select currency"
              )}
              data={currencyOptions}
              {...form.getInputProps("currency")}
              required
            />
            <NumberInput
              label={t(
                "screens.budgets.create.form.amount.label",
                "Budget Amount"
              )}
              min={0}
              {...form.getInputProps("amount")}
              required
            />
            <GualletColorPicker
              label={t(
                "screens.budgets.create.form.colorPicker.label",
                "Color"
              )}
              placeholder={t(
                "screens.budgets.create.form.colorPicker.placeholder",
                "Select the category colour"
              )}
              // {...form.getInputProps("colour")}
              value={form.values.colour}
              onColourSelected={(colour: string) => {
                console.log("Selected colour:", colour);
                form.setFieldValue("colour", colour);
              }}
            />
            <IconPicker
              {...form.getInputProps("icon")}
              name="icon"
              label={t("screens.budgets.create.form.icon.label", "Icon")}
              description={t(
                "screens.budgets.create.form.icon.description",
                "Select an icon for the budget"
              )}
              required
              value={form.values.icon}
              onValueChanged={(iconName) =>
                form.setFieldValue("icon", iconName ?? "")
              }
            />
            <CategoryMultiSelect
              required
              label={t(
                "screens.budgets.create.form.categories.label",
                "Categories"
              )}
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
              {t(
                "screens.budgets.create.form.submitButton.label",
                "Create Budget"
              )}
            </Button>
          </Group>
          {createBudgetMutation.status === "error" && (
            <div style={{ color: "red" }}>
              Error: {createBudgetMutation.error?.message}
            </div>
          )}
        </Stack>
      </form>
    </BaseScreen>
  );
}
