import { formatDate } from "@/utils/dateUtils";
import { useConnectedAccount } from "@guallet/api-react";
import { Group, Tooltip, Text, Badge } from "@mantine/core";

interface ConnectedAccountStatusProps {
  accountId: string;
}
export function ConnectedAccountStatus({
  accountId,
}: Readonly<ConnectedAccountStatusProps>) {
  const { connectedAccount } = useConnectedAccount(accountId);

  return connectedAccount ? (
    <Tooltip
      label={`Last synced at ${formatDate(connectedAccount.updated_at, "LLLL")}`}
      position="top-start"
    >
      <Group>
        <Badge size="xs" color="green">
          Synced
        </Badge>

        <Text size="sm" c="dimmed">
          {formatDate(connectedAccount?.updated_at, "L LT") || "Unknown date"}
        </Text>
      </Group>
    </Tooltip>
  ) : null;
}
