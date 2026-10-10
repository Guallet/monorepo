import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

// Static approval artwork only. Palette follows DESIGN.MD; sample amounts
// are fixed copy. Production components must use theme tokens and Money.format.
const require = createRequire('/tmp/guallet-reports-render/package.json');
const { Resvg } = require('@resvg/resvg-js');
const c = { blue: '#005EB8', cyan: '#41B6E6', navy: '#003087', aqua: '#00A9CE', green: '#009639', red: '#DA291C', text: '#231F20', muted: '#425563', pale: '#E8EDEE', bg: '#F7FAFC', border: '#E5E7EB' };
const text = (x, y, s, size = 14, color = c.text, weight = 400, anchor = 'start') => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}" text-anchor="${anchor}">${s}</text>`;
const rect = (x, y, w, h, fill = 'white', r = 16, border = c.border) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${border}"/>`;
const line = (x, y, x2, y2, color = c.border) => `<path d="M${x} ${y}H${x2}" stroke="${color}"/>`;
const card = (y, h) => `<g filter="url(#shadow)">${rect(16, y, 358, h)}</g>`;
const chevron = (x, y, color = c.muted) => `<path d="M${x} ${y - 5}l5 5-5 5" fill="none" stroke="${color}" stroke-width="1.5"/>`;
function shell(subtitle) {
  return rect(0, 0, 390, 844, c.bg, 28, c.border) +
    text(24, 29, '9:41', 14, c.text, 600) + text(366, 29, '▮▮▮  ▰', 12, c.text, 500, 'end') +
    '<path d="M28 61l-6 6 6 6" stroke="#005EB8" stroke-width="1.5" fill="none"/>' + text(38, 72, 'Dashboard', 14, c.blue, 500) +
    text(16, 116, 'Reports', 32, c.text, 700) + text(16, 142, subtitle, 14, c.muted) +
    rect(16, 160, 244, 44) + text(36, 187, 'September 2026', 16, c.text, 600) + text(238, 187, '⌄', 18, c.blue) +
    rect(268, 160, 106, 44) + text(321, 187, 'Filters', 14, c.blue, 600, 'middle') +
    text(18, 229, 'All accounts · GBP', 12, c.muted) +
    rect(134, 826, 122, 5, c.text, 3, c.text);
}
function segments(y, labels, selected) {
  let out = rect(16, y, 358, 40, c.pale, 12, c.pale);
  labels.forEach((label, i) => {
    const w = 350 / labels.length;
    if (i === selected) out += rect(20 + i * w, y + 4, w, 32, 'white', 9);
    out += text(20 + (i + .5) * w, y + 26, label, 13, i === selected ? c.blue : c.muted, i === selected ? 600 : 400, 'middle');
  });
  return out;
}
const categories = [['Housing', '−£1,100.00', '46%', c.navy, .46], ['Groceries', '−£480.00', '20%', c.blue, .20], ['Transport', '−£320.00', '13%', c.cyan, .13], ['Other', '−£500.00', '21%', c.aqua, .21]];
function categoryRows(y, compact = false) {
  let out = '';
  categories.forEach(([label, amount, pct, color, fraction], i) => {
    const top = y + i * (compact ? 48 : 58);
    out += rect(32, top, 8, 8, color, 4, color) + text(50, top + 9, label, 14, c.text, 500) + text(340, top + 9, amount, 14, c.red, 600, 'end') + chevron(350, top + 4);
    if (!compact) out += rect(50, top + 22, 240, 4, c.pale, 2, c.pale) + rect(50, top + 22, 240 * fraction, 4, color, 2, color) + text(340, top + 27, pct, 12, c.muted, 400, 'end');
    if (compact) out += text(50, top + 27, `${pct} of spending`, 12, c.muted);
  });
  return out;
}
function donut(cx, cy, radius) {
  let out = ''; let offset = 0; const circumference = 2 * Math.PI * radius;
  for (const [, , , color, fraction] of categories) {
    const length = fraction * circumference;
    out += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${color}" stroke-width="20" stroke-dasharray="${length - 5} ${circumference - length + 5}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"/>`;
    offset += length;
  }
  return out;
}
function spending() {
  return shell('See where your money goes') + segments(246, ['Spending', 'Income', 'Cash flow'], 0) +
    card(302, 253) + donut(195, 427, 83) + text(195, 411, 'TOTAL SPENDING', 11, c.muted, 600, 'middle') + text(195, 446, '−£2,400.00', 22, c.red, 700, 'middle') + text(195, 471, 'September', 12, c.muted, 400, 'middle') +
    card(571, 234) + text(32, 600, 'Spending by category', 18, c.text, 600) + categoryRows(622, true);
}
function bars(y) {
  let out = ''; const income = [105, 114, 110, 120, 112, 108.5]; const expense = [80, 90, 76, 97, 87, 74.4];
  [0, 1, 2].forEach(i => { const yy = y - i * 62; out += line(36, yy, 350, yy) + text(36, yy - 7, ['£0', '£2k', '£4k'][i], 10, c.muted); });
  income.forEach((h, i) => { const x = 57 + i * 47; out += rect(x, y - h, 12, h, c.green, 4, c.green) + rect(x + 15, y - expense[i], 12, expense[i], c.red, 4, c.red) + text(x + 13, y + 23, ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'][i], 11, c.muted, 400, 'middle'); });
  return out;
}
function cashflow() {
  return shell('Compare money in and money out') +
    card(246, 123) + text(32, 275, 'NET CASH FLOW', 11, c.muted, 600) + text(32, 316, '+£1,100.00', 34, c.green, 700) + text(32, 344, 'Income minus expenses in September', 13, c.muted) +
    card(385, 269) + text(32, 415, 'Income and expenses', 18, c.text, 600) + text(342, 414, '6 months', 12, c.blue, 600, 'end') + bars(589) +
    rect(36, 634, 7, 7, c.green, 3, c.green) + text(50, 641, 'Income', 11, c.muted) + rect(125, 634, 7, 7, c.red, 3, c.red) + text(139, 641, 'Expenses', 11, c.muted) +
    card(670, 135) + text(32, 701, 'September breakdown', 18, c.text, 600) + text(32, 736, 'Income', 14) + text(339, 736, '+£3,500.00', 16, c.green, 600, 'end') + line(32, 748, 358, 748) + text(32, 779, 'Expenses', 14) + text(339, 779, '−£2,400.00', 16, c.red, 600, 'end') + chevron(350, 775);
}
function overview() {
  return shell('Your month at a glance') +
    card(246, 127) + text(32, 275, 'MONEY LEFT OVER', 11, c.muted, 600) + text(32, 316, '+£1,100.00', 34, c.green, 700) + text(32, 345, '31% of your income retained', 13, c.muted) +
    rect(16, 389, 171, 97) + rect(203, 389, 171, 97) + text(32, 419, 'Income', 14, c.muted) + text(32, 457, '+£3,500.00', 21, c.green, 700) + text(219, 419, 'Expenses', 14, c.muted) + text(219, 457, '−£2,400.00', 21, c.red, 700) +
    card(502, 127) + text(32, 532, 'Largest expense category', 14, c.muted) + text(32, 565, 'Housing', 22, c.text, 600) + text(32, 593, '−£1,100.00', 17, c.red, 600) + text(151, 592, '46% of spending', 12, c.muted) + chevron(349, 568) +
    text(16, 666, 'Explore your reports', 20, c.text, 600) + card(686, 118) + text(32, 720, 'Spending breakdown', 16, c.text, 600) + text(32, 741, 'Compare categories for this month', 12, c.muted) + chevron(349, 723) + line(32, 753, 358, 753) + text(32, 778, 'Cash flow over time', 16, c.text, 600) + chevron(349, 775);
}
const defs = '<defs><filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#003087" flood-opacity=".05"/></filter></defs>';
const wrap = (body, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}<g font-family="Inter, DejaVu Sans, sans-serif" style="font-variant-numeric:tabular-nums">${body}</g></svg>`;
const concepts = [spending(), cashflow(), overview()];
const names = ['01-spending', '02-cash-flow', '03-monthly-summary'];
function save(name, svg) {
  writeFileSync(new URL(`./mobile-reports-${name}.svg`, import.meta.url), svg);
  const fontDir = new URL('../../node_modules/expo-dev-menu/android/src/debug/res/font/', import.meta.url).pathname;
  writeFileSync(new URL(`./mobile-reports-${name}.png`, import.meta.url), new Resvg(svg, {
    fitTo: { mode: 'zoom', value: 2 },
    font: { fontFiles: ['regular', 'medium', 'semibold', 'bold'].map(weight => `${fontDir}inter_${weight}.ttf`), defaultFontFamily: 'Inter' },
  }).render().asPng());
}
concepts.forEach((body, i) => save(names[i], wrap(body, 390, 844)));
let board = rect(0, 0, 1326, 1020, '#F0F4F8', 0, '#F0F4F8') + text(36, 46, 'Guallet / Mobile reports', 28, c.text, 700) + text(36, 74, 'Three design directions · Sample data · September 2026', 14, c.muted);
concepts.forEach((body, i) => {
  const x = 36 + i * 432;
  board += text(x, 112, ['01  Spending first', '02  Cash flow first', '03  Monthly summary'][i], 18, c.blue, 600) + `<g transform="translate(${x},132)">${body}</g>`;
});
save('comparison', wrap(board, 1326, 1020));
