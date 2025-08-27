import { TransactionListScreen } from "@/features/transactions/screens/TransactionListScreen";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

const transactionsSearchSchema = z.object({
  page: z.number().optional().default(1),
  pageSize: z.number().optional().default(50),
});

export const Route = createFileRoute("/_app/transactions/")({
  component: TransactionPage,
  validateSearch: transactionsSearchSchema,
});

function TransactionPage() {
  const navigate = useNavigate({ from: Route.fullPath });

  const { page, pageSize } = Route.useSearch();

  return (
    <TransactionListScreen
      page={page}
      pageSize={pageSize}
      accounts={[]}
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
