import { AccountDto, CategoryDto } from "@guallet/api-client";

export type FilterData = {
  selectedAccounts: AccountDto[];
  selectedCategories: CategoryDto[];
  dateRange: {
    startDate: Date;
    endDate: Date;
  } | null;
};
