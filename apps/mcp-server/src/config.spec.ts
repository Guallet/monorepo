import { describe, expect, it } from 'vitest';
import { getConfig } from './config.js';

describe('MCP configuration', () => {
  it('parses the required database and authorization settings', () => {
    const config = getConfig({
      MCP_APPROVAL_SECRET: 'a'.repeat(32),
      DATABASE_USERNAME: 'postgres',
      DATABASE_PASSWORD: 'postgres',
      DATABASE_NAME: 'guallet',
    });
    expect(config.MCP_PORT).toBe(5100);
    expect(config.MCP_ACCESS_TOKEN_TTL_SECONDS).toBe(900);
    expect(config.MCP_RESOURCE).toBe('http://localhost:5100/mcp');
  });

  it('rejects a short approval secret', () => {
    expect(() =>
      getConfig({
        MCP_APPROVAL_SECRET: 'short',
        DATABASE_USERNAME: 'postgres',
        DATABASE_PASSWORD: 'postgres',
        DATABASE_NAME: 'guallet',
      }),
    ).toThrow();
  });
});
