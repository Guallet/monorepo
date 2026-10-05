import type { QueryRunner, Table } from 'typeorm';

export interface SchemaSnapshot {
  name: string;
  columns: unknown[];
  indices: unknown[];
  uniques: unknown[];
  foreignKeys: unknown[];
  checks: unknown[];
}

const sorted = (items: unknown[]) =>
  items.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
const tableName = (name: string) => name.replace(/^public\./, '');

export const snapshot = (
  table: Table,
  ignoreEmailUnique = false,
): SchemaSnapshot => ({
  name: tableName(table.name),
  columns: sorted(
    table.columns.map((column) => ({
      name: column.name,
      type: column.type,
      length: column.length,
      precision: column.precision ?? null,
      scale: column.scale ?? null,
      nullable: column.isNullable,
      primary: column.isPrimary,
      unique:
        ignoreEmailUnique && column.name === 'email' ? false : column.isUnique,
      generated: column.isGenerated,
      generationStrategy: column.generationStrategy ?? null,
      default: column.default ?? null,
      enum: column.enum ?? null,
      array: column.isArray,
    })),
  ),
  indices: sorted(
    table.indices.map((index) => ({
      columns: index.columnNames,
      unique: index.isUnique,
      where: index.where ?? null,
      spatial: index.isSpatial,
      fulltext: index.isFulltext,
    })),
  ),
  uniques: sorted(
    table.uniques
      .filter(
        (unique) =>
          !(
            ignoreEmailUnique &&
            unique.columnNames.length === 1 &&
            unique.columnNames[0] === 'email'
          ),
      )
      .map((unique) => ({ columns: unique.columnNames })),
  ),
  foreignKeys: sorted(
    table.foreignKeys.map((key) => ({
      columns: key.columnNames,
      table: tableName(key.referencedTableName),
      referencedColumns: key.referencedColumnNames,
      onDelete: key.onDelete,
      onUpdate: key.onUpdate,
      deferrable: key.deferrable ?? null,
    })),
  ),
  checks: sorted(table.checks.map((check) => check.expression)),
});

export const validateSchema = async (
  runner: QueryRunner,
  expected: SchemaSnapshot[],
  ignoreEmailUnique = false,
): Promise<void> => {
  const differences: string[] = [];
  for (const reference of expected) {
    const table = await runner.getTable(reference.name);
    if (!table) {
      differences.push(`${reference.name}: missing table`);
      continue;
    }
    const actual = snapshot(
      table,
      ignoreEmailUnique && reference.name === 'users',
    );
    for (const key of [
      'columns',
      'indices',
      'uniques',
      'foreignKeys',
      'checks',
    ] as const) {
      if (
        JSON.stringify(sorted(actual[key])) !==
        JSON.stringify(sorted([...reference[key]]))
      ) {
        differences.push(
          `${reference.name}.${key}: expected ${JSON.stringify(reference[key])}; received ${JSON.stringify(actual[key])}`,
        );
      }
    }
  }
  if (differences.length)
    throw new Error(`Database schema mismatch:\n${differences.join('\n')}`);
};
