import { readFile, writeFile } from 'node:fs/promises';

const metadataFiles = [
  new URL('../src/metadata.ts', import.meta.url),
  new URL('../dist/metadata.js', import.meta.url),
];

for (const metadataFile of metadataFiles) {
  const source = await readFile(metadataFile, 'utf8');
  const normalized = source.replace(/t\[[^\]]+\]\.Object/g, 'Object');

  if (normalized !== source) {
    await writeFile(metadataFile, normalized);
  }
}
