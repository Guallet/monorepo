import { z } from 'zod';

const environmentSchema = z.object({
  MCP_PORT: z.coerce.number().int().positive().default(5100),
  MCP_PUBLIC_URL: z.string().url().default('http://localhost:5100'),
  MCP_WEBAPP_URL: z.string().url().default('http://localhost:3000'),
  MCP_APPROVAL_SECRET: z.string().min(16),
  MCP_RESOURCE: z.string().url().optional(),
  MCP_ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  MCP_REFRESH_TOKEN_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(2_592_000),
  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.coerce.number().int().positive().default(5432),
  DATABASE_USERNAME: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_NAME: z.string().min(1),
  DATABASE_SSL_ENABLED: z.preprocess((value) => value === 'true', z.boolean()),
});

export type McpConfig = Omit<
  z.infer<typeof environmentSchema>,
  'MCP_RESOURCE'
> & { MCP_RESOURCE: string };

export function getConfig(environment: NodeJS.ProcessEnv): McpConfig {
  const parsed = environmentSchema.parse(environment);
  return {
    ...parsed,
    MCP_RESOURCE: parsed.MCP_RESOURCE ?? `${parsed.MCP_PUBLIC_URL}/mcp`,
  };
}
