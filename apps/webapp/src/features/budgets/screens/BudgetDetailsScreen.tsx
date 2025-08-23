import { BaseScreen } from "@/components/Screens/BaseScreen";
import { useBudget, useBudgetTransactions } from "@guallet/api-react";
import { BudgetCard } from "../components/BudgetCard";
import { Stack, Title, Text } from "@mantine/core";
import { useState } from "react";
import { MonthSelectorHeader } from "@/components/MonthSelectorHeader/MonthSelectorHeader";
import { DebugJson } from "@guallet/ui-react";
import { useTranslation } from "react-i18next";

interface BudgetDetailsScreenProps {
  budgetId: string;
}

export function BudgetDetailsScreen({
  budgetId,
}: Readonly<BudgetDetailsScreenProps>) {
  const { t } = useTranslation();
  const { budget, isLoading } = useBudget(budgetId);

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
      <Stack align="stretch">
        <MonthSelectorHeader
          date={selectedDate}
          onDateChanged={(date: Date) => {
            setSelectedDate(date);
          }}
        />
        {budget && <BudgetCard budgetId={budget.id} />}
        <Title order={2}>
          {t("screens.budgets.details.transactions.title", "Transactions")}
        </Title>
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            // TODO: Implement transaction row card
            <DebugJson key={transaction.id} data={transaction} />
          ))
        ) : (
          <EmptyTransactionsView />
        )}
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
