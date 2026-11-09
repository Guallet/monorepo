import { BankProvider } from '@guallet/api-client';
import { z } from 'zod';
import { createFileRoute } from '@tanstack/react-router';
import { AddAccountScreen } from '@/features/accounts/screens/AddAccountScreen';

export const Route = createFileRoute('/_app/accounts/new')({
  validateSearch: (search): { provider?: BankProvider } => ({
    provider: z
      .enum(['lunchflow', 'banksync', 'synci', 'nordigen'])
      .optional()
      .catch(undefined)
      .parse(search.provider),
  }),
  component: AddAccountPage,
});

export function AddAccountPage() {
  const { provider } = Route.useSearch();
  return <AddAccountScreen key={provider} initialProvider={provider} />;
}
