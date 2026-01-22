import { createAuthClient } from 'better-auth/react';

// Factory function to create auth client with custom configuration
export function createGualletAuthClient(options: {
  baseURL: string;
  // Additional options can be added here
}) {
  return createAuthClient({
    baseURL: options.baseURL,
    // Configure plugins as needed
  });
}

// Type for the auth client instance
export type GualletAuthClient = ReturnType<typeof createGualletAuthClient>;
