const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../../..');
const source = fs.readFileSync(
  path.join(root, 'packages/guallet-theme/src/categoryIcons.ts'),
  'utf8',
);
const names = [
  ...source
    .match(/categoryIconNames = \[([\s\S]*?)\]/)[1]
    .matchAll(/'(Icon\w+)'/g),
].map((x) => x[1]);
const selectable = [
  ...source
    .match(/selectableCategoryIconNames = \[([\s\S]*?)\]/)[1]
    .matchAll(/'(Icon\w+)'/g),
].map((x) => x[1]);
const target = path.join(root, 'apps/android/app/src/main/res/drawable');
const tabler = path.dirname(
  require.resolve('@tabler/icons-react/package.json', { paths: [root] }),
);
const resources = [];
for (const name of names) {
  const actual = name === 'IconGuitar' ? 'IconGuitarPick' : name;
  const text = fs.readFileSync(
    path.join(tabler, 'dist/esm/icons', actual + '.mjs'),
    'utf8',
  );
  const nodes = JSON.parse(text.match(/const __iconNode = (.*);/)[1]);
  let xml =
    '<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24">\n';
  for (const [type, a] of nodes) {
    let d = a.d;
    if (type === 'line') d = `M${a.x1},${a.y1} L${a.x2},${a.y2}`;
    if (type === 'circle')
      d = `M${a.cx - a.r},${a.cy} a${a.r},${a.r} 0,1 0 ${2 * a.r},0 a${a.r},${a.r} 0,1 0 ${-2 * a.r},0`;
    if (type === 'ellipse')
      d = `M${a.cx - a.rx},${a.cy} a${a.rx},${a.ry} 0,1 0 ${2 * a.rx},0 a${a.rx},${a.ry} 0,1 0 ${-2 * a.rx},0`;
    if (type === 'polygon' || type === 'polyline')
      d =
        'M' +
        a.points.trim().split(/\s+/).join(' L') +
        (type === 'polygon' ? ' Z' : '');
    if (type === 'rect') {
      const x = +a.x,
        y = +a.y,
        w = +a.width,
        h = +a.height,
        rx = +(a.rx || 0),
        ry = +(a.ry || a.rx || 0);
      d = `M${x + rx},${y} L${x + w - rx},${y} Q${x + w},${y} ${x + w},${y + ry} L${x + w},${y + h - ry} Q${x + w},${y + h} ${x + w - rx},${y + h} L${x + rx},${y + h} Q${x},${y + h} ${x},${y + h - ry} L${x},${y + ry} Q${x},${y} ${x + rx},${y} Z`;
    }
    if (!d) throw new Error(name + ': unsupported ' + type);
    xml += `    <path android:fillColor="@android:color/transparent" android:strokeColor="#000000" android:strokeWidth="1.5" android:strokeLineCap="round" android:strokeLineJoin="round" android:pathData="${d}" />\n`;
  }
  xml += '</vector>\n';
  const resource = 'category_' + name.slice(4).toLowerCase();
  fs.writeFileSync(path.join(target, resource + '.xml'), xml);
  resources.push([name, resource]);
}
let kotlin =
  '// Generated from the shared category icon contract and Tabler 3.47.0 (MIT).\npackage io.guallet.android.ui.components\n\nimport io.guallet.android.R\n\ninternal val categoryIcons = mapOf(\n';
for (const [name, res] of resources)
  kotlin += `    "${name}" to R.drawable.${res},\n`;
kotlin +=
  ')\nval selectableCategoryIcons = listOf(\n' +
  selectable.map((n) => `    "${n}",`).join('\n') +
  '\n)\n';
fs.writeFileSync(
  path.join(
    root,
    'apps/android/app/src/main/java/io/guallet/android/ui/components/CategoryIcons.kt',
  ),
  kotlin,
);
