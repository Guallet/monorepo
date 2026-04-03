/**
 * Script to change a user's role in the database.
 *
 * Usage: pnpm script:set-role -- [options]
 *
 * Options:
 *   --email <email>   Find user by email (mutually exclusive with --id)
 *   --id <id>         Find user by ID (mutually exclusive with --email)
 *   --role <role>     New role to assign (required)
 *
 * Valid roles: admin, beta, (empty string to clear roles)
 *
 * Examples:
 *   pnpm script:set-role -- --email john@example.com --role admin
 *   pnpm script:set-role -- --id abc123 --role beta
 *   pnpm script:set-role -- --email john@example.com --role ""
 */

import 'dotenv/config';
import { Pool } from 'pg';

const VALID_ROLES = ['admin', 'beta'] as const;
type UserRole = (typeof VALID_ROLES)[number];

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean;
}

function getDatabaseConfig(): DatabaseConfig {
  return {
    host: process.env.DATABASE_HOST ?? '127.0.0.1',
    port: Number(process.env.DATABASE_PORT ?? '5432'),
    user: process.env.DATABASE_USERNAME ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? '',
    database: process.env.DATABASE_NAME ?? 'guallet',
    ssl: (process.env.DATABASE_SSL ?? 'false').toLowerCase() === 'true',
  };
}

function parseArgs(argv: string[]): {
  email?: string;
  id?: string;
  role?: string;
} {
  const args: { email?: string; id?: string; role?: string } = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--email' && i + 1 < argv.length) {
      args.email = argv[++i];
    } else if (arg === '--id' && i + 1 < argv.length) {
      args.id = argv[++i];
    } else if (arg === '--role' && i + 1 < argv.length) {
      args.role = argv[++i];
    }
  }
  return args;
}

function printUsage() {
  console.log(`
Usage: pnpm script:set-role -- [options]

Options:
  --email <email>   Find user by email (mutually exclusive with --id)
  --id <id>         Find user by ID (mutually exclusive with --email)
  --role <role>     New role to assign (required)

Valid roles: ${VALID_ROLES.join(', ')}

Examples:
  pnpm script:set-role -- --email john@example.com --role admin
  pnpm script:set-role -- --id abc123 --role beta
  pnpm script:set-role -- --email john@example.com --role ""
`);
}

async function main(argv: string[]) {
  const args = parseArgs(argv);

  if (!args.email && !args.id) {
    console.error('Error: Either --email or --id must be provided.\n');
    printUsage();
    process.exit(1);
  }

  if (args.email && args.id) {
    console.error(
      'Error: Cannot use both --email and --id at the same time.\n',
    );
    printUsage();
    process.exit(1);
  }

  if (args.role === undefined) {
    console.error('Error: --role is required.\n');
    printUsage();
    process.exit(1);
  }

  // Allow empty string to clear roles, otherwise validate
  if (args.role !== '' && !VALID_ROLES.includes(args.role as UserRole)) {
    console.error(
      `Error: Invalid role "${args.role}". Valid roles are: ${VALID_ROLES.join(', ')} (or "" to clear roles)`,
    );
    process.exit(1);
  }

  const config = getDatabaseConfig();
  const pool = new Pool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
  });

  try {
    // Look up the user
    const lookupQuery = args.email
      ? 'SELECT id, name, email, roles FROM users WHERE email = $1 LIMIT 1'
      : 'SELECT id, name, email, roles FROM users WHERE id = $1 LIMIT 1';
    const lookupValue = args.email ? args.email : args.id!;

    const { rows } = await pool.query(lookupQuery, [lookupValue]);

    if (rows.length === 0) {
      const identifier = args.email
        ? `email "${args.email}"`
        : `id "${args.id}"`;
      console.error(`Error: User not found with ${identifier}.`);
      process.exit(1);
    }

    const user = rows[0] as {
      id: string;
      name: string;
      email: string;
      roles: string;
    };
    const oldRoles = user.roles ?? '';

    // TypeORM simple-array stores as comma-separated string
    await pool.query('UPDATE users SET roles = $1 WHERE id = $2', [
      args.role,
      user.id,
    ]);

    console.log(
      `✅ Updated role for ${user.name} (${user.email}):\n   Before: "${oldRoles}"\n   After:  "${args.role}"`,
    );
  } finally {
    await pool.end();
  }
}

main(process.argv).catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
