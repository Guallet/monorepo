import { useInstitutions, useOpenBankingConnection } from "@guallet/api-react";
import { Card, Group, Stack, Text } from "@mantine/core";
import { InstitutionAvatar } from "./InstitutionAvatar";
import { ConnectionStatusBadge } from "./ConnectionStatusBadge";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/i18n/useLocale";

interface ConnectionCardProps extends React.ComponentProps<typeof Card> {
  connectionId: string;
  onClick?: () => void;
}

export function ConnectionCard({
  connectionId,
  onClick,
  ...props
}: Readonly<ConnectionCardProps>) {
  const { t } = useTranslation();
  const { connection } = useOpenBankingConnection(connectionId);
  const { institutions } = useInstitutions();
  const { locale } = useLocale();

  const institution = institutions.find(
    (inst) => inst.nordigen_id === connection?.institution_id
  );

  const formattedDate = new Date(connection?.created ?? "").toLocaleDateString(
    locale,
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
      <Stack gap="xs">
        {connection && institution && (
          <>
            <Group justify="space-between">
              <Group>
                <InstitutionAvatar institutionId={institution.id} />
                <Text fw={700}>{institution.name}</Text>
              </Group>

              <ConnectionStatusBadge
                status={
                  connection.status ||
                  t("components.connectionCard.status.unknown", "unknown")
                }
              />
            </Group>

            <Text size="sm" c="dimmed">
              {t("components.connectionCard.created", "Created:")}{" "}
              {formattedDate}
            </Text>
            <Text size="sm" c="dimmed">
              {t("components.connectionCard.updated", "Updated:")}{" "}
              {connection.updated_at}
            </Text>
            <Text size="sm">
              {connection.accounts.length > 0
                ? t("components.connectionCard.accountsLinked", {
                    count: connection.accounts.length,
                  })
                : t(
                    "components.connectionCard.noAccountsLinked",
                    "No accounts linked"
                  )}
            </Text>
          </>
        )}

        {/* <Button variant="light">Manage</Button> */}
      </Stack>
    </Card>
  );
}
