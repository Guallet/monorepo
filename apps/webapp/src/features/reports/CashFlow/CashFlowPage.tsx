import { Stack, Text } from "@mantine/core";
import { ReportFilters } from "../components/ReportFilters";
import { LoaderFunction, useLoaderData } from "react-router-dom";
import { Category } from "../../categories/models/Category";
import { Account } from "../../accounts/models/Account";
import { loadAccounts } from "../../accounts/api/accounts.api";
import { loadCategories } from "../../categories/api/categories.api";

type LoaderData = {
  accounts: Account[];
  categories: Category[];
};

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;

  const accounts = await loadAccounts();
  const categories = await loadCategories();

  return {
    accounts,
    categories,
  } as LoaderData;
};

export function CashFlowPage() {
  const { accounts, categories } = useLoaderData() as LoaderData;

  return (
    <Stack>
      <Text>Cash flow</Text>
      <ReportFilters
        accounts={accounts}
        selectedAccounts={[]}
        categories={categories}
        selectedCategories={[]}
        onFiltersUpdate={(x) => {
          console.log("Filters updated", x);
        }}
      />
      <Text>Report here</Text>
    </Stack>
  );
}
