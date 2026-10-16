import { Button, Group } from '@mantine/core';
import { Category } from '../../categories/models/Category';
import { DateRangeButton } from '../../../components/DateRangeButton/DateRangeButton';
import { MultiSelectCheckbox } from '../../../components/MultiSelectCheckbox/MultiComboBox';
import { AccountDto } from '@guallet/api-client';

export type FilterData = {
  selectedAccounts: AccountDto[];
  selectedCategories: Category[];
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
              selectedAccounts: accounts.filter((x) => value.includes(x.id)),
              selectedCategories: categories.filter((x) =>
                selectedCategories.includes(x.id),
              ),
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
              selectedAccounts: accounts.filter((x) =>
                selectedAccounts.includes(x.id),
              ),
              selectedCategories: categories.filter((x) =>
                value.includes(x.id),
              ),
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
              selectedAccounts: accounts.filter((x) =>
                selectedAccounts.includes(x.id),
              ),
              selectedCategories: categories.filter((x) =>
                selectedCategories.includes(x.id),
              ),
              dateRange: selectedRange,
            })
          }
        />
        {dateRange && (
          <Button
            variant="subtle"
            onClick={() =>
              onFiltersUpdate({
                selectedAccounts: accounts.filter((x) =>
                  selectedAccounts.includes(x.id),
                ),
                selectedCategories: categories.filter((x) =>
                  selectedCategories.includes(x.id),
                ),
                dateRange: null,
              })
            }
          >
            Clear date range
          </Button>
        )}
      </Group>
    </div>
  );
}
