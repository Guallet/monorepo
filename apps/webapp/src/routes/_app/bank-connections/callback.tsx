import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { BankAuthorizationCallbackScreen } from '@/features/openbanking/screens/BankAuthorizationCallbackScreen';
export const Route = createFileRoute('/_app/bank-connections/callback')({
  validateSearch: (search) => ({
    connectionId: z.uuid().safeParse(search.connectionId).data,
    authorizationId: z.uuid().safeParse(search.authorizationId).data,
  }),
  component: BankAuthorizationCallbackPage,
});
function BankAuthorizationCallbackPage() {
  return <BankAuthorizationCallbackScreen {...Route.useSearch()} />;
}
