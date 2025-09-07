import { useInstitutions, useOpenBankingConnection } from "@guallet/api-react";
import { Button, Card, Group, Stack, Text } from "@mantine/core";
import { InstitutionAvatar } from "./InstitutionAvatar";
import { ConnectionStatusBadge } from "./ConnectionStatusBadge";

interface ConnectionCardProps extends React.ComponentProps<typeof Card> {
  connectionId: string;
  onClick?: () => void;
}

export function ConnectionCard({
  connectionId,
  onClick,
  ...props
}: Readonly<ConnectionCardProps>) {
  const { connection } = useOpenBankingConnection(connectionId);
  const { institutions } = useInstitutions();

  const institution = institutions.find(
    (inst) => inst.nordigen_id === connection?.institution_id
  );

  const formattedDate = new Date(connection?.created ?? "").toLocaleDateString(
    "en-GB",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <Card
      withBorder
      shadow="sm"
      radius="md"
      {...props}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <Stack>
        {connection && institution && (
          <>
            <Group justify="space-between">
              <Group>
                <InstitutionAvatar institutionId={institution.id} />
                <Text fw={700}>{institution.name}</Text>
              </Group>

              <ConnectionStatusBadge status={connection.status || "unknown"} />
            </Group>

            <Text size="sm" c="dimmed">
              Created: {formattedDate}
            </Text>
            <Text size="sm">
              {connection.accounts.length > 0
                ? `${connection.accounts.length} account${connection.accounts.length > 1 ? "s" : ""} linked`
                : "No accounts linked"}
            </Text>
          </>
        )}

        {/* <Button variant="light">Manage</Button> */}
      </Stack>
    </Card>
  );
}
