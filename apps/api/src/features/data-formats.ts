/**
 * Shared format definitions used by both the import and export pipelines.
 * Centralised here so the supported-format list never drifts between the two.
 */

/** All data-transfer formats understood by the import/export system. */
export type DataFormat = 'csv' | 'ofe' | 'json';

/** Runtime list of every format that the import and export pipelines support. */
export const SUPPORTED_DATA_FORMATS: DataFormat[] = ['csv', 'ofe', 'json'];
