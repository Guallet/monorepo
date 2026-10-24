import { Button, Group } from '@mantine/core';
import { Category } from '../../categories/models/Category';
import { DateRangeButton } from '../../../components/DateRangeButton/DateRangeButton';
import { MultiSelectCheckbox } from '../../../components/MultiSelectCheckbox/MultiComboBox';
import { AccountDto } from '@guallet/api-client';
import { useTranslation } from 'react-i18next';

export type FilterData = {
  selectedAccounts: string[];
  selectedCategories: string[];
  dateRange: {
    startDate: Date;
    endDate: Date;
  } | null;
};

interface IProps {
  accounts: AccountDto[];
  categories: Category[];
  selectedAccounts: string[];
  selectedCategories: string[];
  dateRange: FilterData['dateRange'];
  onFiltersUpdate: (filters: FilterData) => void;
}

export function ReportFilters({
  accounts,
  categories,
  selectedAccounts,
  selectedCategories,
  dateRange,
  onFiltersUpdate,
}: Readonly<IProps>) {
  const { t } = useTranslation();

  return (
    <div>
      <h1>Reports Filters</h1>
      <Group>
        <MultiSelectCheckbox
          data={accounts.map((account) => ({
            value: account.id,
            label: account.name,
          }))}
          value={selectedAccounts}
          onChange={(value) =>
            onFiltersUpdate({
              selectedAccounts: value,
              selectedCategories,
              dateRange,
            })
          }
          placeholder="Select the accounts"
          allItemsSelectedMessage="All accounts selected"
        />
        <MultiSelectCheckbox
          data={categories.map((category) => ({
            value: category.id,
            label: category.name,
          }))}
          value={selectedCategories}
          onChange={(value) =>
            onFiltersUpdate({
              selectedAccounts,
              selectedCategories: value,
              dateRange,
            })
          }
          placeholder="Select the categories"
          allItemsSelectedMessage="All categories selected"
        />
        <DateRangeButton
          selectedRange={dateRange}
          onRangeSelected={(selectedRange) =>
            onFiltersUpdate({
              selectedAccounts,
              selectedCategories,
              dateRange: selectedRange,
            })
          }
        />
        {dateRange && (
          <Button
            variant="subtle"
            onClick={() =>
              onFiltersUpdate({
                selectedAccounts,
                selectedCategories,
                dateRange: null,
              })
            }
          >
            {t('screens.reports.filters.clearDateRange', 'Clear date range')}
          </Button>
        )}
      </Group>
    </div>
  );
}
