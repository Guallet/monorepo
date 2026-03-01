/**
 * Transaction shape available to export engines.
 * amount may arrive as a string from TypeORM decimal columns.
 */
export interface ExportTransaction {
  id: string;
  accountId: string;
  description: string;
  notes?: string;
  amount: number | string;
  currency: string;
  date: Date;
  categoryId?: string | null;
}

/** Parameters passed to every export engine */
export interface ExportEngineParams {
  transactions: ExportTransaction[];
  accountsMap: Map<string, string>;
  categoriesMap: Map<string, string>;
}

/** Contract every format-specific engine must satisfy */
export interface ExportEngine {
  /** Produce the file content for the given transactions */
  generateContent(params: ExportEngineParams): string;

  /** File extension including the dot, e.g. ".csv" */
  readonly fileExtension: string;

  /** Human-readable label for emails / notifications, e.g. "CSV" */
  readonly formatLabel: string;
}
