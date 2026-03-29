import { createAuthClient } from 'better-auth/react';
import { emailOTPClient, magicLinkClient } from 'better-auth/client/plugins';

export interface CreateAuthClientOptions {
  baseURL: string;
  basePath?: string;
  /** Additional Better Auth client plugins (e.g. expoClient for React Native) */
  plugins?: any[];
}

/**
 * Creates a Guallet Auth client with the provided configuration.
 * This should be called by the consumer application with their specific baseURL.
 * It uses Better Auth under the hood, but abstracts away the implementation details from the consumer.
 *
 * @param options - Configuration options for the auth client
 * @param options.baseURL - The base URL of your API server
 * @param options.basePath - The path where auth routes are mounted (defaults to '/auth')
 * @returns A configured Guallet Auth client
 */
export function createGualletAuthClient(options: CreateAuthClientOptions) {
  const { baseURL, basePath = '/auth', plugins = [] } = options;

  return createAuthClient({
    baseURL,
    basePath,
    plugins: [emailOTPClient(), magicLinkClient(), ...plugins],
  });
}
