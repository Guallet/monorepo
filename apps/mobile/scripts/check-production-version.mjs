import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const configPath = 'app.config.ts';
const currentConfig = readFileSync(configPath, 'utf8');
const previousConfig = execFileSync(
  'git',
  ['show', `HEAD^:apps/mobile/${configPath}`],
  { encoding: 'utf8' },
);

function readVersion(config) {
  const match = config.match(/\bversion:\s*['"]([^'"]+)['"]/);
  if (!match) {
    throw new Error(`Could not find version in ${configPath}`);
  }
  return match[1];
}

const currentVersion = readVersion(currentConfig);
const previousVersion = readVersion(previousConfig);

if (currentVersion === previousVersion) {
  throw new Error(
    `Production version must change from ${previousVersion} before releasing`,
  );
}

console.log(`Production version changed: ${previousVersion} -> ${currentVersion}`);
