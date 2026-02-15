import { AccountSource } from 'src/features/accounts/entities/accountSource.model';
import { AccountType } from 'src/features/accounts/entities/accountType.model';

// Default values for CSV import
export const DEFAULT_CURRENCY = 'GBP';
export const DEFAULT_ACCOUNT_TYPE = AccountType.CURRENT_ACCOUNT;
export const DEFAULT_ACCOUNT_SOURCE = AccountSource.IMPORTED;

// Default category styling
export const DEFAULT_CATEGORY_ICON = 'tag';
export const DEFAULT_CATEGORY_COLOR = '#999999';
