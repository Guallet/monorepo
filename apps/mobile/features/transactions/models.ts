export type TransactionListFilters = {
  accounts?: string[];
  categories?: string[];
  startDate?: Date;
  endDate?: Date;
};

export type DateRangePreset =
  | 'all'
  | 'today'
  | 'this-month'
  | 'last-30-days'
  | 'custom';

export type TransactionFilterDraft = {
  accountIds: string[];
  categoryIds: string[];
  startDate: Date | null;
  endDate: Date | null;
  datePreset: DateRangePreset;
};
