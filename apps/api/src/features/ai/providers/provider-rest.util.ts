import { ProviderModelListError } from './provider-model-list.error.js';

const REQUEST_TIMEOUT_MS = 10_000;

export async function fetchProviderJson<T>({
  url,
  apiToken,
}: {
  url: string;
  apiToken?: string;
}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'TimeoutError';
    throw new ProviderModelListError(
      isTimeout ? 'Provider request timed out' : 'Provider request failed',
    );
  }

  if (!response.ok) {
    throw new ProviderModelListError(
      `Provider returned ${response.status}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}
