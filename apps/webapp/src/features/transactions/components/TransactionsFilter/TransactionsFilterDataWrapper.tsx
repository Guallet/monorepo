import { AccountDto, CategoryDto } from "@guallet/api-client";
import { TransactionsFilter } from "./TransactionsFilter";
import { FilterData } from "./FilterData";
import { useAccounts, useCategories } from "@guallet/api-react";

interface TransactionsFilterDataWrapperProps {
  selectedAccounts: AccountDto[] | string[];
  selectedCategories: CategoryDto[] | string[];
  onFiltersUpdate: (filters: FilterData) => void;
}

export function TransactionsFilterDataWrapper({
  selectedAccounts,
  selectedCategories,
  onFiltersUpdate,
}: Readonly<TransactionsFilterDataWrapperProps>) {
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  // If the selectedAccounts array is string[], map them to an AccountDto[] first
  const mappedSelectedAccounts = selectedAccounts
    .map((account) =>
      typeof account === "string"
        ? accounts.find((a) => a.id === account)
        : account
    )
    .filter((account): account is AccountDto => account !== undefined);

  const mappedSelectedCategories = selectedCategories
    .map((category) =>
      typeof category === "string"
        ? categories.find((c) => c.id === category)
        : category
    )
    .filter((category): category is CategoryDto => category !== undefined);

  return (
    <TransactionsFilter
      accounts={accounts}
      selectedAccounts={mappedSelectedAccounts}
      categories={categories}
      selectedCategories={mappedSelectedCategories}
      onFiltersUpdate={onFiltersUpdate}
    />
  );
}
