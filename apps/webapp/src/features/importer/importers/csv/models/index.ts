// TODO: Maybe migrate this to Zustand?
export const CSV_MIME_TYPE = "text/csv";

export interface CsvInfoType {
  data: unknown[];
  properties: string[];
}

// Things we need to proceed with a CSV import
// 1. Destination Account
// 2. Transaction Date
// 3. Transaction Amount
// 4. Transaction Name/Description
// 5. Transaction Notes
// 6. Category (Optional)
export type PropertyName =
  | "account"
  | "date"
  | "amount"
  | "description"
  | "notes"
  | "category";
export type FieldMappings = Record<PropertyName, string>;
