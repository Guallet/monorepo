import {
  useConnectionMutations,
  useOpenBankingAccountsForConnection,
} from '@guallet/api-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { notifications } from '@/lib/notifications';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

interface ConnectionCallbackScreenProps {
  connectionId?: string | null;
  error?: string | null;
  details?: string | null;
}

export function ConnectionCallbackScreen({
  connectionId,
  error,
  details,
}: Readonly<ConnectionCallbackScreenProps>) {
  const { accounts, isLoading } =
    useOpenBankingAccountsForConnection(connectionId);
  const { linkObAccountsMutation } = useConnectionMutations();
  const navigate = useNavigate();
  const alreadyLinkedRef = useRef(false);

  useEffect(() => {
    if (!connectionId || accounts.length === 0 || alreadyLinkedRef.current) {
      return;
    }

    alreadyLinkedRef.current = true;

    const accountIds = accounts.map((account) => account.id);

    linkObAccountsMutation.mutate(
      { accountIds },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Accounts linked successfully',
            message: `${accountIds.length} accounts linked`,
            color: 'green',
          });
        },
        onError: (mutationError) => {
          console.error('Error linking accounts:', mutationError);
        },
      },
    );
  }, [connectionId, accounts, linkObAccountsMutation]);

  if (error) {
    return (
      <ErrorView
        error={error}
        details={details}
        onActionPressed={() => {
          navigate({ to: '/connections', replace: true });
        }}
      />
    );
  }

  if (linkObAccountsMutation.isError) {
    return (
      <ErrorView
        error={linkObAccountsMutation.error?.message}
        details={linkObAccountsMutation.error?.cause?.toString()}
        onActionPressed={() => {
          navigate({ to: '/connections', replace: true });
        }}
      />
    );
  }

  if (isLoading || linkObAccountsMutation.isPending) {
    return (
      <div className="flex min-h-[160px] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        <p className="text-sm text-muted-foreground">Syncing accounts...</p>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <EmptyAccountsView
        onActionPressed={() => {
          navigate({ to: '/connections', replace: true });
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Connected to the following accounts:
      </p>
      {accounts.map((account) => {
        return (
          <Card key={account.id}>
            <CardContent className="space-y-1 pt-6 text-sm">
              <p className="font-semibold">
                {account.details.name ?? account.details.ownerName}
              </p>
              <p>Details: {account.details.details}</p>
              <p>Account number: {account.details.bban}</p>
              <p>Iban: {account.details.iban}</p>
              <p>Currency: {account.details.currency}</p>
              <p>Type: {account.details.cashAccountType}</p>
            </CardContent>
          </Card>
        );
      })}
      <Button
        onClick={() => {
          navigate({ to: '/accounts', replace: true });
        }}
      >
        Go back to accounts
      </Button>
    </div>
  );
}

interface ErrorViewProps {
  error: string;
  details?: string | null;
  onActionPressed: () => void;
}
function ErrorView({
  error,
  details,
  onActionPressed,
}: Readonly<ErrorViewProps>) {
  return (
    <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
      <p className="font-semibold">Error adding the account</p>
      <p>Error: {error}</p>
      {details ? <p>What went wrong: {details}</p> : null}
      <Button onClick={onActionPressed}>Go back to connections</Button>
    </div>
  );
}

interface EmptyAccountsViewProps {
  onActionPressed: () => void;
}
function EmptyAccountsView({
  onActionPressed,
}: Readonly<EmptyAccountsViewProps>) {
  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <p>There are no accounts available to connect</p>
      <Button onClick={onActionPressed}>Go back to connections</Button>
    </div>
  );
}
