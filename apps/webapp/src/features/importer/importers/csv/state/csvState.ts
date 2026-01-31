import { AccountDto, CategoryDto } from '@guallet/api-client';
import { CsvInfoType, FieldMappings } from '../models';
import { create } from 'zustand';

interface CsvState {
  csvInfo: CsvInfoType;
  csvMappings: FieldMappings;
  accountMappings: Record<string, AccountDto | null | undefined>;
  categoriesMappings: Record<string, CategoryDto | null | undefined>;
}

interface CsvActions {
  setCsvInfo: (info: CsvInfoType) => void;
  setCsvMappings: (mappings: FieldMappings) => void;
  setAccountMappings: (
    mappings: Record<string, AccountDto | null | undefined>,
  ) => void;
  setCategoriesMappings: (
    mappings: Record<string, CategoryDto | null | undefined>,
  ) => void;
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

const useCsvStore = create<CsvState & { actions: CsvActions }>((set) => ({
  ...initialState,
  actions: {
    setCsvInfo: (csvInfo) => set({ csvInfo }),
    setCsvMappings: (csvMappings) => set({ csvMappings }),
    setAccountMappings: (accountMappings) => set({ accountMappings }),
    setCategoriesMappings: (categoriesMappings) => set({ categoriesMappings }),
    reset: () => set(initialState),
  },
}));

// Atomic selectors for state
export const useCsvInfo = () => useCsvStore((state) => state.csvInfo);
export const useCsvMappings = () => useCsvStore((state) => state.csvMappings);
export const useAccountMappings = () =>
  useCsvStore((state) => state.accountMappings);
export const useCategoriesMappings = () =>
  useCsvStore((state) => state.categoriesMappings);

// Actions hook
export const useCsvActions = () => useCsvStore((state) => state.actions);

// Selectors for derived state
export const useCsvFields = () => {
  const csvInfo = useCsvInfo();
  return csvInfo.properties;
};

export const useCsvAccounts = () => {
  const csvInfo = useCsvInfo();
  const csvMappings = useCsvMappings();

  const accounts = csvInfo.data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((x: any) => {
      const account = x[csvMappings.account];
      return account as string | undefined;
    })
    // Remove Undefined and empty accounts
    .filter((x) => x !== undefined)
    // Force the conversion to string
    .map((x) => x.toString())
    // Remove empty name accounts. I don't think this is required
    .filter((x) => x.length > 0);

  // Remove duplicates
  return [...new Set(accounts)];
};

export const useCsvCategories = () => {
  const csvInfo = useCsvInfo();
  const csvMappings = useCsvMappings();

  const categories = csvInfo.data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((x: any) => {
      return x[csvMappings.category];
    })
    // Remove undefined
    .filter((x) => x !== undefined)
    // Force the conversion to string
    .map((x) => x.toString())
    // Remove empty names
    .filter((x) => x.length > 0);
  // Remove duplicates
  return [...new Set(categories)];
};
