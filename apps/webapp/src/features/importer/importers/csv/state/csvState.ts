import { AccountDto, CategoryDto } from '@guallet/api-client';
import { CsvInfoType, FieldMappings } from '../models';
import { create } from 'zustand';

type CsvRow = Record<string, unknown>;
type CsvFieldValue = string | number | boolean | null | undefined;
type AccountMappingValue = AccountDto | null | undefined;
type CategoryMappingValue = CategoryDto | null | undefined;
type AccountMappings = Record<string, AccountMappingValue>;
type CategoriesMappings = Record<string, CategoryMappingValue>;

interface CsvStoreState extends CsvState {
  actions: CsvActions;
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

interface CsvState {
  csvInfo: CsvInfoType;
  csvMappings: FieldMappings;
  accountMappings: AccountMappings;
  categoriesMappings: CategoriesMappings;
}

interface CsvActions {
  setCsvInfo: (info: CsvInfoType) => void;
  setCsvMappings: (mappings: FieldMappings) => void;
  setAccountMappings: (mappings: AccountMappings) => void;
  setCategoriesMappings: (mappings: CategoriesMappings) => void;
  reset: () => void;
}

const initialState: CsvState = {
  csvInfo: {
    data: [],
    properties: [],
  },
  csvMappings: {
    account: '',
    date: '',
    amount: '',
    description: '',
    notes: '',
    category: '',
  },
  accountMappings: {},
  categoriesMappings: {},
};

const useCsvStore = create<CsvStoreState>(
  (
    set: (
      partial:
        | Partial<CsvStoreState>
        | ((state: CsvStoreState) => Partial<CsvStoreState>),
    ) => void,
  ) => ({
    ...initialState,
    actions: {
      setCsvInfo: (csvInfo: CsvInfoType) => set({ csvInfo }),
      setCsvMappings: (csvMappings: FieldMappings) => set({ csvMappings }),
      setAccountMappings: (accountMappings: AccountMappings) =>
        set({ accountMappings }),
      setCategoriesMappings: (categoriesMappings: CategoriesMappings) =>
        set({ categoriesMappings }),
      reset: () => set(() => ({ ...initialState })),
    },
  }),
);

// Atomic selectors for state
export const useCsvInfo = () =>
  useCsvStore((state: CsvStoreState) => state.csvInfo);
export const useCsvMappings = () =>
  useCsvStore((state: CsvStoreState) => state.csvMappings);
export const useAccountMappings = () =>
  useCsvStore((state: CsvStoreState) => state.accountMappings);
export const useCategoriesMappings = () =>
  useCsvStore((state: CsvStoreState) => state.categoriesMappings);

// Actions hook
export const useCsvActions = () =>
  useCsvStore((state: CsvStoreState) => state.actions);

// Selectors for derived state
export const useCsvFields = () => {
  const csvInfo = useCsvInfo();
  return csvInfo.properties;
};

export const useCsvAccounts = (): string[] => {
  const csvInfo = useCsvInfo();
  const csvMappings = useCsvMappings();
  const rows = csvInfo.data as CsvRow[];

  const accounts = rows
    .map((row: CsvRow) => row[csvMappings.account] as CsvFieldValue)
    // Remove Undefined and empty accounts
    .filter(isDefined)
    // Force the conversion to string
    .map((value: CsvFieldValue) => String(value))
    // Remove empty name accounts. I don't think this is required
    .filter((value: string) => value.length > 0);

  // Remove duplicates
  return [...new Set(accounts)];
};

export const useCsvCategories = (): string[] => {
  const csvInfo = useCsvInfo();
  const csvMappings = useCsvMappings();
  const rows = csvInfo.data as CsvRow[];

  const categories = rows
    .map((row: CsvRow) => row[csvMappings.category] as CsvFieldValue)
    // Remove undefined
    .filter(isDefined)
    // Force the conversion to string
    .map((value: CsvFieldValue) => String(value))
    // Remove empty names
    .filter((value: string) => value.length > 0);
  // Remove duplicates
  return [...new Set(categories)];
};
