import { AppSection } from "@/components/Cards/AppSection";
import { BaseScreen } from "@/components/Screens/BaseScreen";
import { DeleteDialogConfirmation } from "@/components/Dialogs/DeleteDialogConfirmation";
import { AccountInput } from "@/features/accounts/components/AccountInput";
import { CategoryPicker } from "@/features/categories/components/CategoryPicker/CategoryPicker";
import { CategoryDto, UpdateTransactionRequest } from "@guallet/api-client";
import { useCategory, useTransaction, useTransactionMutations } from "@guallet/api-react";
import {
  Button,
  Group,
  NumberInput,
  SegmentedControl,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

const formSchema = z.object({
  type: z.enum(["expense", "income"]),
  accountId: z.string().min(2, { error: "Account ID is invalid" }),
  description: z
    .string()
    .min(2, { error: "Description should have at least 2 letters" }),
  notes: z.string().optional().nullable(),
  amount: z.number().gt(0, { error: "Amount must be positive" }),
  date: z.date(),
  categoryId: z.string().optional().nullable(),
});
type EditTransactionFormData = z.infer<typeof formSchema>;

interface EditTransactionScreenProps {
  transactionId: string;
}

export function EditTransactionScreen({
  transactionId,
}: Readonly<EditTransactionScreenProps>) {
  const navigate = useNavigate();
  const { transaction, isLoading } = useTransaction(transactionId);
  const { category } = useCategory(transaction?.categoryId ?? null);
  const {
    updateTransactionMutation,
    deleteTransactionMutation,
  } = useTransactionMutations();
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(
    null
  );
  const syncedTransactionIdRef = useRef<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const form = useForm<EditTransactionFormData>({
    validate: zod4Resolver(formSchema),
    initialValues: {
      type: "expense",
      accountId: "",
      description: "",
      notes: "",
      amount: 0,
      date: new Date(),
      categoryId: null,
    },
  });

  useEffect(() => {
    if (transaction && syncedTransactionIdRef.current !== transaction.id) {
      form.setValues({
        type: transaction.amount >= 0 ? "income" : "expense",
        accountId: transaction.accountId,
        description: transaction.description,
        notes: transaction.notes ?? "",
        amount: Math.abs(transaction.amount),
        date: new Date(transaction.date),
        categoryId: transaction.categoryId ?? null,
      });
      syncedTransactionIdRef.current = transaction.id;
    }
  }, [form, transaction]);

  useEffect(() => {
    setSelectedCategory(category);
  }, [category]);

  async function onFormSubmit(data: EditTransactionFormData) {
    try {
      const request: UpdateTransactionRequest = {
        accountId: data.accountId,
        description: data.description,
        notes: data.notes ?? "",
        amount: data.type === "income" ? data.amount : -data.amount,
        date: data.date,
        categoryId: data.categoryId ?? null,
        currency: transaction?.currency ?? null,
      };

      await updateTransactionMutation.mutateAsync({
        id: transactionId,
        request,
      });

      notifications.show({
        title: "Success",
        message: "Transaction updated successfully",
        color: "green",
      });
      navigate({ to: "/transactions" });
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to update transaction",
        color: "red",
      });
    }
  }

  async function onDeleteTransaction() {
    try {
      await deleteTransactionMutation.mutateAsync({ id: transactionId });
      notifications.show({
        title: "Success",
        message: "Transaction deleted successfully",
        color: "green",
      });
      navigate({ to: "/transactions" });
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to delete transaction",
        color: "red",
      });
    }
  }

  return (
    <BaseScreen isLoading={isLoading}>
      <DeleteDialogConfirmation
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
        }}
        onConfirm={() => {
          onDeleteTransaction();
        }}
        title="Delete transaction"
        message="Are you sure you want to delete this transaction?"
      />
      <AppSection title="Edit Transaction">
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
              label="Description"
              placeholder="Enter transaction description"
              {...form.getInputProps("description")}
            />
            <Textarea
              resize="vertical"
              label="Notes"
              placeholder="Enter transaction notes"
              {...form.getInputProps("notes")}
            />
            <AccountInput
              required
              label="Account"
              placeholder="Select an account"
              {...form.getInputProps("accountId")}
            />
            <NumberInput
              required
              label="Amount"
              placeholder="Enter transaction amount"
              decimalScale={2}
              fixedDecimalScale
              {...form.getInputProps("amount")}
            />
            <DateInput
              required
              label="Date"
              placeholder="Select transaction date"
              maxDate={new Date()}
              {...form.getInputProps("date")}
            />
            <CategoryPicker
              label="Category"
              placeholder="Select a category"
              selectedCategory={selectedCategory}
              onCategorySelected={(category: CategoryDto) => {
                setSelectedCategory(category);
                form.setFieldValue("categoryId", category.id);
              }}
            />
            <Group>
              <Button type="submit">Update Transaction</Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigate({ to: "/transactions" });
                }}
              >
                Cancel
              </Button>
              <Button
                color="red"
                onClick={() => {
                  setIsDeleteDialogOpen(true);
                }}
              >
                Delete
              </Button>
            </Group>
          </Stack>
        </form>
      </AppSection>
    </BaseScreen>
  );
}
