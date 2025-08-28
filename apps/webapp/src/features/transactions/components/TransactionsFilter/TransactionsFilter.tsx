import { AccountsPicker } from "@/features/accounts/components/AccountPicker/AccountsPicker";
import { CategoryMultiSelectCheckbox } from "@/components/Categories/CategoryMultiSelectCheckbox";
import { DateRangeButton } from "@/components/DateRangeButton/DateRangeButton";
import { Category } from "@/features/categories/models/Category";
import { Card, Group, Modal, Text } from "@mantine/core";
import { useState } from "react";
import { FilterData } from "./FilterData";
import { AccountDto, CategoryDto } from "@guallet/api-client";

interface TransactionsFilterProps {
  accounts: AccountDto[];
  selectedAccounts: AccountDto[];

  categories: CategoryDto[];
  selectedCategories: CategoryDto[];

  onFiltersUpdate: (filters: FilterData) => void;
}

export function TransactionsFilter({
  accounts,
  selectedAccounts,
  categories,
  selectedCategories,
  onFiltersUpdate,
}: Readonly<TransactionsFilterProps>) {
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  } | null>(null);

  const [modalOpened, setModalOpened] = useState(false);

  return (
    <>
      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
        }}
      >
        <Text>Hello modal</Text>
      </Modal>
      <Card withBorder radius="md">
        <Group>
          <AccountsPicker
            selectedAccounts={selectedAccounts}
            onSelectedAccountsChange={(value) => {
              onFiltersUpdate({
                selectedAccounts: value,
                selectedCategories: selectedCategories,
                dateRange: dateRange,
              });
            }}
          />
          <CategoryMultiSelectCheckbox
            categories={categories}
            selectedCategories={[]}
            onSelectionChanged={(selectedCategories: Category[]) => {
              console.log(
                "Selected Categories from filter: ",
                selectedCategories
              );
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
        </Group>
      </Card>
    </>
  );
}
