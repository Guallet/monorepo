import { AccountsPicker } from '@/features/accounts/components/AccountPicker/AccountsPicker';
import { DateRangeButton } from '@/components/DateRangeButton/DateRangeButton';
import { Card, Group, Stack, Box, Button } from '@mantine/core';
import { FilterData } from './FilterData';
import { AccountDto, CategoryDto } from '@guallet/api-client';
import { CategoryPicker } from '@/features/categories/components/CategoryPicker/CategoryPicker';
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
      <Stack gap="sm">
        <AccountsPicker
          selectedAccounts={filters.selectedAccounts ?? []}
          onSelectedAccountsChange={(accounts: AccountDto[]) => {
            onFiltersUpdate({
              ...filters,
              selectedAccounts: accounts,
            });
          }}
        />
        <CategoryPicker
          mode="multiple"
          label={t(
            'components.transactionsFilter.categories.label',
            'Categories',
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
        <Button
          variant="outlined"
          leftSection={<IconFilterOff size={16} />}
          onClick={handleResetFilters}
          fullWidth
        >
          {t('components.transactionsFilter.reset', 'Reset filters')}
        </Button>

        <Button
          variant="filled"
          onClick={() => onCloseMobileModal?.()}
          fullWidth
        >
          {t('components.transactionsFilter.apply', 'Apply filters')}
        </Button>
      </Stack>
    );
  }

  // Desktop view: Show filters in a Card with horizontal layout and proper alignment
  return (
    <Card withBorder radius="md" padding="md" shadow="sm">
      <Group gap="md" align="flex-end">
        <Box style={{ minWidth: 200 }}>
          <AccountsPicker
            selectedAccounts={filters.selectedAccounts ?? []}
            onSelectedAccountsChange={(accounts: AccountDto[]) => {
              onFiltersUpdate({
                ...filters,
                selectedAccounts: accounts,
              });
            }}
          />
        </Box>
        <Box style={{ minWidth: 200, flexGrow: 1 }}>
          <CategoryPicker
            mode="multiple"
            label={t(
              'components.transactionsFilter.categories.label',
              'Categories',
            )}
            selectedCategories={filters.selectedCategories ?? []}
            onSelectionChanged={(categories: CategoryDto[]) => {
              onFiltersUpdate({
                ...filters,
                selectedCategories: categories,
              });
            }}
          />
        </Box>
        <Box style={{ minWidth: 200 }}>
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
        </Box>
        <Box>
          <Button
            variant="outlined"
            leftSection={<IconFilterOff size={16} />}
            onClick={handleResetFilters}
          >
            {t('components.transactionsFilter.reset', 'Reset filters')}
          </Button>
        </Box>
      </Group>
    </Card>
  );
}
