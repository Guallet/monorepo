import { TransactionListScreen } from "@/features/transactions/screens/TransactionListScreen";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

const transactionsSearchSchema = z.object({
  page: z.number().optional().default(1),
  pageSize: z.number().optional().default(50),
  accounts: z.array(z.string()).nullable().optional(),
  categories: z.array(z.string()).nullable().optional(),
});

export const Route = createFileRoute("/_app/transactions/")({
  component: TransactionPage,
  validateSearch: transactionsSearchSchema,
});

function TransactionPage() {
  const navigate = useNavigate({ from: Route.fullPath });

  const { page, pageSize, accounts, categories } = Route.useSearch();

  return (
    <TransactionListScreen
      page={page}
      pageSize={pageSize}
      accounts={accounts ?? null}
      categories={categories ?? null}
      onAddTransaction={() => {
        navigate({
          to: "/transactions/create",
        });
      }}
      onFiltersUpdated={(filters) => {
        navigate({
          search: (prev) => ({
            ...prev,
            accounts:
              filters.selectedAccounts && filters.selectedAccounts.length > 0
                ? filters.selectedAccounts.map((a) => a.id)
                : undefined,
            categories:
              filters.selectedCategories &&
              filters.selectedCategories.length > 0
                ? filters.selectedCategories.map((c) => c.id)
                : undefined,
          }),
        });
      }}
      onPageChange={(page) => {
        navigate({
          search: (prev) => ({
            ...prev,
            page: page,
          }),
        });
      }}
    />
  );
}
