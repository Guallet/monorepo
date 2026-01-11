import { AccountsPicker } from "@/features/accounts/components/AccountPicker/AccountsPicker";
import { DateRangeButton } from "@/components/DateRangeButton/DateRangeButton";
import { Card, Group, Stack } from "@mantine/core";
import { FilterData } from "./FilterData";
import { AccountDto, CategoryDto } from "@guallet/api-client";
import { CategoryMultiSelect } from "@/features/categories/components/CategoryMultiSelect/CategoryMultiSelect";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/useIsMobile";

interface TransactionsFilterProps {
  filters: FilterData;
  onFiltersUpdate: (filters: FilterData) => void;
}

export function TransactionsFilter({
  filters,
  onFiltersUpdate,
}: Readonly<TransactionsFilterProps>) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const filterContent = (
    <>
      <AccountsPicker
        selectedAccounts={filters.selectedAccounts ?? []}
        onSelectedAccountsChange={(accounts: AccountDto[]) => {
          onFiltersUpdate({
            ...filters,
            selectedAccounts: accounts,
          });
        }}
      />
      <CategoryMultiSelect
        label={t(
          "components.transactionsFilter.categories.label",
          "Categories"
        )}
        selectedCategories={filters.selectedCategories ?? []}
        onSelectionChanged={(categories: CategoryDto[]) => {
          onFiltersUpdate({
            ...filters,
            selectedCategories: categories,
          });
        }}
      />
      <DateRangeButton
        selectedRange={filters.dateRange ?? null}
        onRangeSelected={(selectedRange) => {
          if (selectedRange) {
            onFiltersUpdate({
              ...filters,
              dateRange: selectedRange,
            });
          } else {
            onFiltersUpdate({
              ...filters,
              dateRange: null,
            });
          }
        }}
      />
    </>
  );

  // Mobile view: Stack filters vertically without Card wrapper
  if (isMobile) {
    return (
      <Stack gap="md">
        {filterContent}
      </Stack>
    );
  }

  // Desktop view: Show filters in a Card with horizontal layout
  return (
    <Card withBorder radius="md" p="md">
      <Group gap="md">
        {filterContent}
      </Group>
    </Card>
  );
}
