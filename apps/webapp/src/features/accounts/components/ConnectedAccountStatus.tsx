import { formatDate } from "@/utils/dateUtils";
import { useConnectedAccount } from "@guallet/api-react";

interface ConnectedAccountStatusProps {
  accountId: string;
}
export function ConnectedAccountStatus({
  accountId,
}: Readonly<ConnectedAccountStatusProps>) {
  const { connectedAccount } = useConnectedAccount(accountId);

  return connectedAccount ? (
    <div
      className="flex items-center gap-2"
      title={`Last synced at ${formatDate(connectedAccount.updated_at, 'LLLL')}`}
    >
      <span className="rounded-full border border-green-500/40 bg-green-500/10 px-2 py-0.5 text-xs text-green-700">
        Synced
      </span>

      <span className="text-sm text-muted-foreground">
        {formatDate(connectedAccount?.updated_at, 'L LT') || 'Unknown date'}
      </span>
    </div>
  ) : null;
}
