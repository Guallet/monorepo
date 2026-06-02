import { ProviderModelListError } from './provider-model-list.error';

export async function fetchProviderJson<T>({
  url,
  apiToken,
}: {
  url: string;
  apiToken?: string;
}): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
    },
  });

  if (!response.ok) {
    throw new ProviderModelListError(
      `Provider returned ${response.status}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}
