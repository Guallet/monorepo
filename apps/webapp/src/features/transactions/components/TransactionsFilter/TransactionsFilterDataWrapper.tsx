import { AccountDto, CategoryDto } from '@guallet/api-client';
import { TransactionsFilter } from './TransactionsFilter';
import { FilterData } from './FilterData';
import { useAccounts, useCategories } from '@guallet/api-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useDisclosure } from '@/hooks/useDisclosure';
import { IconFilter } from '@tabler/icons-react';
import { ResponsiveModal } from '@guallet/ui-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TransactionsFilterDataWrapperProps {
  selectedAccounts: AccountDto[] | string[] | null;
  selectedCategories: CategoryDto[] | string[] | null;
  dateRange: { startDate: Date; endDate: Date } | null;
  onFiltersUpdate: (filters: FilterData) => void;
}

export function TransactionsFilterDataWrapper({
  selectedAccounts,
  selectedCategories,
  dateRange,
  onFiltersUpdate,
}: Readonly<TransactionsFilterDataWrapperProps>) {
  const isMobile = useIsMobile();
  const [opened, { open, close }] = useDisclosure();
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  const mappedSelectedAccounts = (selectedAccounts ?? accounts)
    .map((account) =>
      typeof account === 'string'
        ? accounts.find((a) => a.id === account)
        : account,
    )
    .filter((account): account is AccountDto => account !== undefined);

  const mappedSelectedCategories = (selectedCategories ?? categories)
    .map((category) =>
      typeof category === 'string'
        ? categories.find((c) => c.id === category)
        : category,
    )
    .filter((category): category is CategoryDto => category !== undefined);

  const handleFiltersUpdate = (newFilters: FilterData) => {
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
  };

  const filters = {
    selectedAccounts: mappedSelectedAccounts,
    selectedCategories: mappedSelectedCategories,
    dateRange: dateRange,
  };

  // Count active filters
  const activeFiltersCount = [
    mappedSelectedAccounts.length > 0 &&
      mappedSelectedAccounts.length < accounts.length,
    mappedSelectedCategories.length > 0 &&
      mappedSelectedCategories.length < categories.length,
    dateRange !== null,
  ].filter(Boolean).length;

  // Mobile view: Show filter icon with badge
  if (isMobile) {
    return (
      <>
        <Card className="rounded-md border p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Filters</p>

            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={open}
                aria-label="Open filters"
                className="h-9 w-9"
              >
                <IconFilter className="h-5 w-5" />
              </Button>

              {activeFiltersCount > 0 ? (
                <span
                  className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground"
                  aria-hidden="true"
                >
                  {activeFiltersCount}
                </span>
              ) : null}
            </div>
          </div>
        </Card>

        <ResponsiveModal
          opened={opened}
          onClose={close}
          title="Filter Transactions"
          size="lg"
        >
          <div className="pt-1">
            <TransactionsFilter
              filters={filters}
              onFiltersUpdate={handleFiltersUpdate}
              onCloseMobileModal={() => {
                close();
              }}
            />
          </div>
        </ResponsiveModal>
      </>
    );
  }

  // Desktop view: Show filters inline
  return (
    <TransactionsFilter
      filters={filters}
      onFiltersUpdate={handleFiltersUpdate}
      onCloseMobileModal={() => {
        close();
      }}
    />
  );
}
