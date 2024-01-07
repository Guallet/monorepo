import { CategoryMultiSelectCheckbox } from "@/components/Categories/CategoryMultiSelectCheckbox";
import { DateRangeButton } from "@/components/DateRangeButton/DateRangeButton";
import { MultiSelectCheckbox } from "@/components/MultiSelectCheckbox/MultiComboBox";
import { Account } from "@/features/accounts/models/Account";
import { Category } from "@/features/categories/models/Category";
import { Flex, Text } from "@mantine/core";
import { useState } from "react";

export type FilterData = {
  selectedAccounts: Account[];
  selectedCategories: Category[];
  dateRange: {
    startDate: Date;
    endDate: Date;
  } | null;
};

interface IProps {
  accounts: Account[];
  selectedAccounts: Account[];

  categories: Category[];
  selectedCategories: Category[];

  onFiltersUpdate: (filters: FilterData) => void;
}

export function TransactionsFilter({
  accounts,
  selectedAccounts,
  categories,
  selectedCategories,
  onFiltersUpdate,
}: IProps) {
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  } | null>(null);

  return (
    <Flex>
      <Text>Filter</Text>
      <MultiSelectCheckbox
        data={[...new Set(accounts.map((x) => x.name))]}
        placeholder="Select the accounts"
        allItemsSelectedMessage="All accounts selected"
      />
      <CategoryMultiSelectCheckbox
        categories={categories}
        selectedCategories={[]}
        onSelectionChanged={(selectedCategories: Category[]) => {
          console.log("Selected Categories from filter: ", selectedCategories);
          onFiltersUpdate({
            selectedAccounts: selectedAccounts,
            selectedCategories: selectedCategories,
            dateRange: dateRange,
          });
        }}
      />
      <DateRangeButton
        selectedRange={dateRange}
        onRangeSelected={(selectedRange) => {
          console.log("Selected Date Range from filter: ", selectedRange);
          let filterDateRange: {
            startDate: Date;
            endDate: Date;
          } | null = null;
          if (selectedRange) {
            filterDateRange = {
              startDate: selectedRange.startDate,
              endDate: selectedRange.endDate,
            };
            setDateRange(filterDateRange);
          } else {
            setDateRange(null);
          }

          onFiltersUpdate({
            selectedAccounts: selectedAccounts,
            selectedCategories: selectedCategories,
            dateRange: filterDateRange,
          });
        }}
      />
    </Flex>
  );
}
