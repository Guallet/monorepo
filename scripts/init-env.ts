import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const exampleFile = path.join(rootDir, '.env.docker.example');
const targetFile = path.join(rootDir, '.env');

// Fields to ignore (leave empty or keep as is, but request asks to leave empty)
// Map fields to their help text/URL
const fieldsToClear: Record<string, string> = {
  RESEND_API_KEY: 'Get a key from https://resend.com/api-keys',
  VITE_SENTRY_DSN: 'Get the value from https://sentry.io/',
  APITALLY_CLIENT_ID: 'https://apitally.io/',
  NORDIGEN_SECRET_ID: '',
  NORDIGEN_SECRET_KEY: '',
  VITE_SUPABASE_URL: 'https://supabase.com/',
  VITE_SUPABASE_KEY: 'https://supabase.com/',
};

// Fields to generate random secrets for
const fieldsToGenerate = [
  'AUTH_JWT_SECRET',
  'POSTGRES_PASSWORD',
  'REDIS_PASSWORD',
  'PGADMIN_PASSWORD',
];

function generateSecret(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

function processLine(line: string): string {
  if (!line || line.startsWith('#')) return line;

  const [key, ...valueParts] = line.split('=');
  const trimmedKey = key.trim();

  if (fieldsToGenerate.includes(trimmedKey)) {
    // Generate a secure random string
    return `${trimmedKey}=${generateSecret()}`;
  }

  if (trimmedKey in fieldsToClear) {
    // Leave empty
    return `${trimmedKey}=`;
  }

  return line;
}

try {
  if (!fs.existsSync(exampleFile)) {
    console.error(`Error: Could not find ${exampleFile}`);
    process.exit(1);
  }

  console.log('Generating .env file from .env.docker.example...');

  const content = fs.readFileSync(exampleFile, 'utf8');
  const lines = content.split('\n');
  const newLines = lines.map(processLine);
  const newContent = newLines.join('\n');

  fs.writeFileSync(targetFile, newContent);

  console.log('✅ .env file created successfully!');
  console.log('\n---------------------------------------------------------');
  console.log(
    '⚠️  ACTION REQUIRED: You must manually fill in the following values in .env:',
  );
  Object.entries(fieldsToClear).forEach(([field, help]) => {
    console.log(`   - ${field}: ${help}`);
  });
  console.log('---------------------------------------------------------\n');
} catch (error) {
  console.error('Error creating .env file:', error);
  process.exit(1);
}
