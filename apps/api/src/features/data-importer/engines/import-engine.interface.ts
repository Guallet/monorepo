import { DataImportRequestDto } from '../dto/data-import-request.dto.js';

/** Result returned by every import engine */
export interface ImportEngineResult {
  processed: number;
  failed: number;
}

/**
 * Contract every format-specific import engine must satisfy.
 *
 * The engine receives the full DTO so it can read format-specific fields.
 * It also receives `userId` and a progress callback for long-running imports.
 */
export interface ImportEngine {
  /** Human-readable label for logs / notifications */
  readonly formatLabel: string;

  /**
   * Execute the import.
   *
   * @param userId  – authenticated user
   * @param dto     – the full import request (engine reads its own fields)
   * @param onProgress – optional callback to report progress (0-100)
   */
  execute(
    userId: string,
    dto: DataImportRequestDto,
    onProgress?: (percent: number) => Promise<void>,
  ): Promise<ImportEngineResult>;
}
