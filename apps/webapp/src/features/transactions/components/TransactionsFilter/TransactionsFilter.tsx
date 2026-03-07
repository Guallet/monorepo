import { AccountsPicker } from '@/features/accounts/components/AccountPicker/AccountsPicker';
import { DateRangeButton } from '@/components/DateRangeButton/DateRangeButton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FilterData } from './FilterData';
import { AccountDto, CategoryDto } from '@guallet/api-client';
import { CategoryMultiSelect } from '@/features/categories/components/CategoryMultiSelect/CategoryMultiSelect';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAccounts, useCategories } from '@guallet/api-react';
import { IconFilterOff } from '@tabler/icons-react';

interface TransactionsFilterProps {
  filters: FilterData;
  onFiltersUpdate: (filters: FilterData) => void;
  onCloseMobileModal?: () => void;
}

export function TransactionsFilter({
  filters,
  onFiltersUpdate,
  onCloseMobileModal,
}: Readonly<TransactionsFilterProps>) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  const updateAccounts = (nextAccounts: AccountDto[]) => {
    onFiltersUpdate({
      ...filters,
      selectedAccounts: nextAccounts,
    });
  };

  const updateCategories = (nextCategories: CategoryDto[]) => {
    onFiltersUpdate({
      ...filters,
      selectedCategories: nextCategories,
    });
  };

  const updateDateRange = (
    selectedRange: { startDate: Date; endDate: Date } | null,
  ) => {
    onFiltersUpdate({
      ...filters,
      dateRange: selectedRange,
    });
  };

  const handleResetFilters = () => {
    onFiltersUpdate({
      selectedAccounts: accounts,
      selectedCategories: categories,
      dateRange: null,
    });

    onCloseMobileModal?.();
  };

  // Mobile view: Stack filters vertically
  if (isMobile) {
    return (
      <div className="flex flex-col gap-3">
        <AccountsPicker
          selectedAccounts={filters.selectedAccounts ?? []}
          onSelectedAccountsChange={updateAccounts}
        />

        <CategoryMultiSelect
          label={t(
            'components.transactionsFilter.categories.label',
            'Categories',
          )}
          selectedCategories={filters.selectedCategories ?? []}
          onSelectionChanged={updateCategories}
        />

        <DateRangeButton
          selectedRange={filters.dateRange ?? null}
          onRangeSelected={updateDateRange}
        />

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={handleResetFilters}
        >
          <IconFilterOff className="h-4 w-4" />
          {t('components.transactionsFilter.reset', 'Reset filters')}
        </Button>

        <Button
          type="button"
          className="w-full"
          onClick={() => onCloseMobileModal?.()}
        >
          {t('components.transactionsFilter.apply', 'Apply filters')}
        </Button>
      </div>
    );
  }

  // Desktop view: Show filters in a Card with horizontal layout and proper alignment
  return (
    <Card className="rounded-md border p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[200px]">
          <AccountsPicker
            selectedAccounts={filters.selectedAccounts ?? []}
            onSelectedAccountsChange={updateAccounts}
          />
        </div>

        <div className="min-w-[200px] flex-1">
          <CategoryMultiSelect
            label={t(
              'components.transactionsFilter.categories.label',
              'Categories',
            )}
            selectedCategories={filters.selectedCategories ?? []}
            onSelectionChanged={updateCategories}
          />
        </div>

        <div className="min-w-[200px]">
          <DateRangeButton
            selectedRange={filters.dateRange ?? null}
            onRangeSelected={updateDateRange}
          />
        </div>

        <div>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={handleResetFilters}
          >
            <IconFilterOff className="h-4 w-4" />
            {t('components.transactionsFilter.reset', 'Reset filters')}
          </Button>
        </div>
      </div>
    </Card>
  );
}
