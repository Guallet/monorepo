import { BaseScreen } from "@/components/Screens/BaseScreen";
import {
  useBudget,
  useBudgetMutations,
  useBudgetTransactions,
} from "@guallet/api-react";
import { BudgetCard } from "../components/BudgetCard";
import { Stack, Title, Text, Group, ActionIcon, Tooltip } from "@mantine/core";
import { useState } from "react";
import { MonthSelectorHeader } from "@/components/MonthSelectorHeader/MonthSelectorHeader";
import { useTranslation } from "react-i18next";
import { AppSection } from "@/components/Cards/AppSection";
import { TransactionRow } from "@/features/transactions/components/TransactionRow";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { DeleteDialogConfirmation } from "@/components/Dialogs/DeleteDialogConfirmation";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";

interface BudgetDetailsScreenProps {
  budgetId: string;
}

export function BudgetDetailsScreen({
  budgetId,
}: Readonly<BudgetDetailsScreenProps>) {
  const { t } = useTranslation();
  const { deleteBudgetMutation } = useBudgetMutations();
  const { budget, isLoading } = useBudget(budgetId);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { transactions } = useBudgetTransactions({
    budgetId,
    args: {
      month: selectedDate.getMonth() + 1,
      year: selectedDate.getFullYear(),
    },
  });

  return (
    <BaseScreen isLoading={isLoading}>
      <DeleteDialogConfirmation
        isOpen={isDeleteAccountModalOpen}
        title={t(
          "screens.budgets.details.delete.dialog.title",
          "Deleted budget"
        )}
        message={t(
          "screens.budgets.details.delete.dialog.message",
          "Are you sure you want to delete the budget?"
        )}
        onClose={() => {
          setIsDeleteAccountModalOpen(false);
        }}
        onConfirm={() => {
          // Handle account deletion
          setIsDeleteAccountModalOpen(false);

          deleteBudgetMutation.mutate(budgetId, {
            onSuccess: () => {
              notifications.show({
                title: t(
                  "screens.budgets.details.delete.notifications.title",
                  "Budget deleted"
                ),
                message: t(
                  "screens.budgets.details.delete.notifications.message",
                  "The budget has been deleted."
                ),
              });
              navigate({ to: "/budgets" });
            },
            onError: (error) => {
              notifications.show({
                title: t(
                  "screens.budgets.details.delete.notifications.error.title",
                  "Error deleting budget"
                ),
                message: t(
                  "screens.budgets.details.delete.notifications.error.message",
                  "An error occurred while deleting the budget."
                ),
              });
            },
          });
        }}
      />
      <Stack align="stretch">
        <Group>
          <Title order={2} flex={1}>
            {budget?.name}
          </Title>
          <Tooltip
            label={t("screens.budgets.details.editButton.tooltip", "Edit")}
          >
            <ActionIcon
              variant="outline"
              onClick={() => {
                console.log("Edit budget");
              }}
            >
              <IconEdit style={{ width: "70%", height: "70%" }} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
          <Tooltip
            label={t("screens.budgets.details.deleteButton.tooltip", "Delete")}
          >
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => {
                setIsDeleteAccountModalOpen(true);
              }}
            >
              <IconTrash style={{ width: "70%", height: "70%" }} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
        </Group>
        <MonthSelectorHeader
          style={{ flexGrow: 1 }}
          date={selectedDate}
          onDateChanged={(newDate: Date) => {
            setSelectedDate(newDate);
          }}
        />
        {budget && <BudgetCard budgetId={budget.id} />}
        <Title order={2}>
          {t("screens.budgets.details.transactions.title", "Transactions")}
        </Title>
        <AppSection>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                avatarType="category"
              />
            ))
          ) : (
            <EmptyTransactionsView />
          )}
        </AppSection>
      </Stack>
    </BaseScreen>
  );
}

function EmptyTransactionsView() {
  const { t } = useTranslation();
  return (
    <Stack align="stretch">
      <Text>
        {t(
          "screens.budgets.details.transactions.emptyView.body",
          "No transactions found for the current selected month"
        )}
      </Text>
    </Stack>
  );
}
