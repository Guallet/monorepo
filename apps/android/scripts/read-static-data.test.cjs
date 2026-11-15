const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readStaticData } = require('./read-static-data.cjs');

test('reads TypeScript object literals without executing module code', () => {
  assert.deepEqual(
    readStaticData(
      `export const json = { $data: ['currency', 2, null, true, false, { $name: 'Ccy' }], };`,
    ),
    { $data: ['currency', 2, null, true, false, { $name: 'Ccy' }] },
  );
});
for (const expression of [
  'process.exit(1)',
  '(() => { throw new Error("executed"); })()',
  'globalThis.secret',
  '{ ...process.env }',
  '{ get secret() { return process.env; } }',
  '`interpolated ${process.env.SECRET}`',
]) {
  test(`rejects executable expressions: ${expression}`, () => {
    assert.throws(
      () => readStaticData(`export const json = ${expression};`),
      /Only static dataset/,
    );
  });
}
test('rejects malformed or ambiguous data declarations', () => {
  for (const source of [
    'export const json = {',
    'const other = {};',
    'const json = {}; const json = {};',
  ])
    assert.throws(() => readStaticData(source));
});
