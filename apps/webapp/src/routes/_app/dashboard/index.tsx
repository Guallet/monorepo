import { BalanceTrendCard } from "@/features/dashboard/components/cards/BalanceTrendCard";
import { BudgetsCard } from "@/features/dashboard/components/cards/BudgetsCard";
import { CategoriesCard } from "@/features/dashboard/components/cards/CategoriesCard";
import { InOutChartCard } from "@/features/dashboard/components/cards/InOutChartCard";
import { PendingTransactionsCard } from "@/features/dashboard/components/cards/PendingTransactionsCard";
import { ScheduledTransactionsCard } from "@/features/dashboard/components/cards/ScheduledTransactionsCard";
import { TotalBalanceCard } from "@/features/dashboard/components/cards/TotalBalanceCard";
import { SimpleGrid } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard/")({
  component: DashboardPage,
});

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
