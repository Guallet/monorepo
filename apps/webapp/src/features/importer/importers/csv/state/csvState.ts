import { AccountDto, CategoryDto } from "@guallet/api-client";
import { CsvInfoType, FieldMappings } from "../models";
import { atom } from "jotai";

// TODO: Maybe migrate the state to Zustand?
export const csvInfoAtom = atom<CsvInfoType>({
  data: [],
  properties: [],
});

// Derived Atom to extract the CSV fields
export const csvFieldsAtom = atom((get) => {
  const csvData = get(csvInfoAtom);
  return csvData.properties;
});

export const csvMappingsAtom = atom<FieldMappings>({
  account: "",
  date: "",
  amount: "",
  description: "",
  notes: "",
  category: "",
});

export const csvAccountsAtom = atom((get) => {
  const csvData = get(csvInfoAtom);
  const mappings = get(csvMappingsAtom);

  const accounts = csvData.data
    .map((x: any) => {
      const account = x[mappings.account];
      return account;
    })
    // Remove Undefined and empty accounts
    .filter((x) => x)
    // Force the conversion to string
    .map((x) => `${x}`)
    // Remove empty name accounts. I don't think this is required
    .filter((x) => x);

  // Remove duplicates
  return [...new Set(accounts)];
});

export const accountMappingsAtom = atom<
  Record<string, AccountDto | null | undefined>
>({});

export const csvCategoriesAtom = atom((get) => {
  const csvData = get(csvInfoAtom);
  const mappings = get(csvMappingsAtom);

  const categories = csvData.data
    .map((x: any) => {
      return x[mappings.category];
    })
    // Remove undefined
    .filter((x) => x)
    // Force the conversion to string
    .map((x) => `${x}`)
    // Remove empty accounts
    .filter((x) => x);

  // Remove duplicates
  return [...new Set(categories)];
});

export const categoriesMappingsAtom = atom<
  Record<string, CategoryDto | null | undefined>
>({});
