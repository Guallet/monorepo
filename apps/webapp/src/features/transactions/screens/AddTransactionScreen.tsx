import { AppSection } from "@/components/Cards/AppSection";
import { BaseScreen } from "@/components/Screens/BaseScreen";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useForm } from "@mantine/form";
import { useTransactionMutations } from "@guallet/api-react";
import {
  Button,
  NumberInput,
  SegmentedControl,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { AccountInput } from "@/features/accounts/components/AccountInput";
import { CategoryPicker } from "@/features/categories/components/CategoryPicker/CategoryPicker";
import { CategoryDto, CreateTransactionRequest } from "@guallet/api-client";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";

const formSchema = z.object({
  type: z.enum(["expense", "income"]),
  accountId: z.string().min(2, { error: "Account ID is invalid" }),
  description: z
    .string()
    .min(2, { error: "Description should have at least 2 letters" }),
  notes: z.string().optional().nullable(),
  amount: z.number({ error: "Amount must be positive" }),
  date: z.string(),
  categoryId: z.string().optional().nullable(),
});
type TransactionsFormData = z.infer<typeof formSchema>;

export function AddTransactionScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { createTransactionMutation } = useTransactionMutations();
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(
    null
  );

  const form = useForm<TransactionsFormData>({
    mode: "uncontrolled",
    validate: zod4Resolver(formSchema),
    initialValues: {
      type: "expense",
      accountId: "",
      description: "",
      notes: "",
      amount: 0,
      date: new Date().toDateString(),
      categoryId: null,
    },
  });

  async function onFormSubmit(data: TransactionsFormData): Promise<void> {
    console.log("Form submitted:", data);

    const request = {
      accountId: data.accountId,
      description: data.description,
      notes: data.notes,
      amount: data.type === "income" ? data.amount : -data.amount,
      date: new Date(data.date),
      categoryId: data.categoryId,
    } as CreateTransactionRequest;

    await createTransactionMutation.mutateAsync(request, {
      onSuccess: (data) => {
        console.log("Transaction created successfully:", data);
        notifications.show({
          title: "Success",
          message: "Transaction created successfully",
          color: "green",
        });
        navigate({ to: "/transactions" });
      },
      onError: (error) => {
        console.error("Error creating transaction:", error);
        notifications.show({
          title: "Error",
          message: "Failed to create transaction",
          color: "red",
        });
      },
    });
  }

  return (
    <BaseScreen>
      <AppSection
        title={t("screens.transactions.create.title", "Add Transaction")}
      >
        <form onSubmit={form.onSubmit(onFormSubmit)}>
          <Stack>
            <SegmentedControl
              value={form.values.type}
              onChange={(value) =>
                form.setFieldValue("type", value as "expense" | "income")
              }
              data={["expense", "income"]}
              fullWidth
              withItemsBorders
            />
            <TextInput
              required
              label={t(
                "screens.transactions.create.form.description.label",
                "Description"
              )}
              placeholder={t(
                "screens.transactions.create.form.description.placeholder",
                "Enter transaction description"
              )}
              {...form.getInputProps("description")}
            />
            <Textarea
              resize="vertical"
              label={t("screens.transactions.create.form.notes.label", "Notes")}
              placeholder={t(
                "screens.transactions.create.form.notes.placeholder",
                "Enter transaction notes"
              )}
              {...form.getInputProps("notes")}
            />
            <AccountInput
              required
              label={t(
                "screens.transactions.create.form.account.label",
                "Account"
              )}
              placeholder={t(
                "screens.transactions.create.form.account.placeholder",
                "Select an account"
              )}
              {...form.getInputProps("accountId")}
            />
            <NumberInput
              required
              label={t(
                "screens.transactions.create.form.amount.label",
                "Amount"
              )}
              placeholder={t(
                "screens.transactions.create.form.amount.placeholder",
                "Enter transaction amount"
              )}
              decimalScale={2}
              fixedDecimalScale
              {...form.getInputProps("amount")}
            />
            <DateInput
              required
              label={t("screens.transactions.create.form.date.label", "Date")}
              placeholder={t(
                "screens.transactions.create.form.date.placeholder",
                "Select transaction date"
              )}
              maxDate={new Date()}
              {...form.getInputProps("date")}
            />
            <CategoryPicker
              required
              label={t(
                "screens.transactions.create.form.category.label",
                "Category"
              )}
              placeholder={t(
                "screens.transactions.create.form.category.placeholder",
                "Select a category"
              )}
              selectedCategory={selectedCategory}
              onCategorySelected={(category: CategoryDto) => {
                setSelectedCategory(category);
                form.setFieldValue("categoryId", category.id || null);
              }}
              {...form.getInputProps("categoryId")}
            />

            <Button type="submit">
              {t(
                "screens.transactions.create.form.submitButton.label",
                "Add Transaction"
              )}
            </Button>
          </Stack>
        </form>
      </AppSection>
    </BaseScreen>
  );
}
