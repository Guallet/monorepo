import { AccountDto, CategoryDto } from "@guallet/api-client";
import { TransactionsFilter } from "./TransactionsFilter";
import { FilterData } from "./FilterData";
import { useAccounts, useCategories } from "@guallet/api-react";

interface TransactionsFilterDataWrapperProps {
  selectedAccounts: AccountDto[] | string[] | null;
  selectedCategories: CategoryDto[] | string[] | null;
  onFiltersUpdate: (filters: FilterData) => void;
}

export function TransactionsFilterDataWrapper({
  selectedAccounts,
  selectedCategories,
  onFiltersUpdate,
}: Readonly<TransactionsFilterDataWrapperProps>) {
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  const mappedSelectedAccounts = (selectedAccounts ?? accounts)
    .map((account) =>
      typeof account === "string"
        ? accounts.find((a) => a.id === account)
        : account
    )
    .filter((account): account is AccountDto => account !== undefined);

  const mappedSelectedCategories = (selectedCategories ?? categories)
    .map((category) =>
      typeof category === "string"
        ? categories.find((c) => c.id === category)
        : category
    )
    .filter((category): category is CategoryDto => category !== undefined);

  return (
    <TransactionsFilter
      filters={{
        selectedAccounts: mappedSelectedAccounts,
        selectedCategories: mappedSelectedCategories,
      }}
      onFiltersUpdate={(newFilters: FilterData) => {
        const finalFilters = { ...newFilters };

        // Because all the accounts are selected, just return null or undefined
        if (newFilters.selectedAccounts?.length === accounts.length) {
          finalFilters.selectedAccounts = undefined;
        }
        // Because all the categories are selected, just return null or undefined
        if (newFilters.selectedCategories?.length === categories.length) {
          finalFilters.selectedCategories = undefined;
        }
        onFiltersUpdate(finalFilters);
      }}
    />
  );
}
