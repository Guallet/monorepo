export class CsvImportRequestDto {
  csvData: CsvRowData[];
  fieldMappings: FieldMappings;
  accountMappings: Record<string, AccountMapping>;
  categoryMappings: Record<string, CategoryMapping>;
}

export interface CsvRowData {
  [key: string]: string | number | boolean | null | undefined;
}

export interface FieldMappings {
  account: string;
  date: string;
  amount: string;
  description: string;
  notes: string;
  category: string;
}

export interface AccountMapping {
  id?: string;
  name: string;
  shouldCreate: boolean;
}

export interface CategoryMapping {
  id?: string;
  name: string;
  shouldCreate: boolean;
}
