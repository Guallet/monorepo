import { router } from '@/router';

/**
 * Validates if a given path is a valid route in the application.
 * Uses TanStack Router's buildLocation to verify the route exists.
 *
 * @param options - Route validation options
 * @param options.to - The route path to validate (must start with '/')
 * @param options.params - Optional route parameters
 * @param options.search - Optional search parameters
 * @returns true if the path is valid, false otherwise
 */
export function isValidRoute({
  to,
  params,
  search,
}: {
  to: string;
  params?: Record<string, unknown>;
  search?: Record<string, unknown>;
}): boolean {
  try {
    // Use router.buildLocation to validate the route exists
    // This will throw if the route is invalid
    const parsed = router.buildLocation({
      to,
      params,
      search,
    });
    console.debug('Route validation successful:', parsed);
    return true;
  } catch (error) {
    // If buildLocation throws, the route doesn't exist or is invalid
    console.error('Route validation error:', { to, params, search, error });
    return false;
  }
}

/**
 * Validates and returns a route path if it's valid.
 *
 * @param to - The route path to validate
 * @param params - Optional route parameters
 * @param search - Optional search parameters
 * @returns The validated path
 * @throws Error if the path is invalid or doesn't exist in the router
 */
export function validateRoute({
  to,
  params,
  search,
}: {
  to: string;
  params?: Record<string, unknown>;
  search?: Record<string, unknown>;
}): string {
  if (!isValidRoute({ to, params, search })) {
    throw new Error(
      `Invalid route: "${to}" does not exist in the application router`,
    );
  }
  return to;
}
