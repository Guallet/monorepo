import { Paper, SimpleGrid } from "@mantine/core";
import { TotalBalanceCard } from "./components/cards/TotalBalanceCard";
import { CategoriesCard } from "./components/cards/CategoriesCard";
import { BudgetsCard } from "./components/cards/BudgetsCard";
import { ScheduledTransactionsCard } from "./components/cards/ScheduledTransactionsCard";
import { BalanceTrendCard } from "./components/cards/BalanceTrendCard";
import { PendingTransactionsCard } from "./components/cards/PendingTransactionsCard";
import { InOutChartCard } from "./components/cards/InOutChartCard";

export function DashboardPage() {
  return (
    <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
      <BalanceTrendCard />
      <TotalBalanceCard />
      <InOutChartCard />
      <CategoriesCard />
      <BudgetsCard />
      <ScheduledTransactionsCard />
      <PendingTransactionsCard />
    </SimpleGrid>
  );
}
