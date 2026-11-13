const fs = require('fs');
const vm = require('vm');
const base = require('path').resolve(__dirname, '../../..');
const source = fs.readFileSync(
  base + '/packages/guallet-money/src/data/data.ts',
  'utf8',
);
const data = vm.runInNewContext(
  source.replace('export const json =', 'const json =') + '\njson;',
);
const seen = new Map();
for (const row of data.$data[0].$data) {
  const get = (k) => row.$data.find((x) => x.$name === k)?.$data;
  const code = get('Ccy');
  if (!code || seen.has(code)) continue;
  const decimal = Number(get('CcyMnrUnts'));
  let symbol = code;
  try {
    symbol = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
    })
      .formatToParts(0)
      .find((x) => x.type === 'currency').value;
  } catch {}
  seen.set(code, {
    name: get('CcyNm'),
    places: Number.isFinite(decimal) && decimal >= 0 ? Math.trunc(decimal) : 0,
    symbol,
  });
}
let out =
  '// Generated from packages/guallet-money/src/data/data.ts. Regenerate with scripts/generate-currencies.cjs.\npackage io.guallet.android.core.money\n\ninternal val currencyCatalog = listOf(\n';
for (const [code, d] of [...seen.entries()].sort())
  out += `    Currency(${JSON.stringify(code)}, ${JSON.stringify(d.name)}, ${d.places}, ${JSON.stringify(d.symbol)}),\n`;
out += ')\n';
fs.mkdirSync(
  base + '/apps/android/app/src/main/java/io/guallet/android/core/money',
  { recursive: true },
);
fs.writeFileSync(
  base +
    '/apps/android/app/src/main/java/io/guallet/android/core/money/CurrencyCatalog.kt',
  out,
);
