import { Group, MultiSelect } from "@mantine/core";
import { Category } from "../../categories/models/Category";
import { Account } from "../../accounts/models/Account";
import { useState } from "react";
import { DateRangeButton } from "../../../components/DateRangeButton/DateRangeButton";
import { MultiSelectCheckbox } from "../../../components/MultiSelectCheckbox/MultiComboBox";

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

export function ReportFilters({
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
    <div>
      <h1>Reports Filters</h1>
      <Group>
        <MultiSelectCheckbox
          data={[...new Set(accounts.map((x) => x.name))]}
          placeholder="Select the accounts"
          allItemsSelectedMessage="All accounts selected"
        />
        <MultiSelectCheckbox
          data={[...new Set(categories.map((x) => x.name))]}
          placeholder="Select the categories"
          allItemsSelectedMessage="All categories selected"
        />

        {/* <MultiSelect
          label="Selected accounts"
          placeholder="No accounts selected"
          searchable
          clearable
          data={[...new Set(accounts.map((x) => x.name))]}
        /> */}
        {/* <MultiSelect
          label="Selected categories"
          placeholder="No categories selected"
          searchable
          clearable
          data={[...new Set(categories.map((x) => x.name))]}
        /> */}
        <DateRangeButton
          selectedRange={dateRange}
          onRangeSelected={(selectedRange) => {
            console.log("Selected Range: ", selectedRange);
            if (selectedRange) {
              setDateRange({
                startDate: selectedRange.startDate,
                endDate: selectedRange.endDate,
              });
            } else {
              setDateRange(null);
            }
          }}
        />
      </Group>
    </div>
  );
}
