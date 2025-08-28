import { AccountDto, CategoryDto } from "@guallet/api-client";

export type FilterData = {
  selectedAccounts?: AccountDto[] | null;
  selectedCategories?: CategoryDto[] | null;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  } | null;
};
