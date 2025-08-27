import { Group, Title, ActionIcon, Tooltip } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

interface TransactionScreenHeaderProps
  extends React.ComponentPropsWithoutRef<typeof Group> {
  onAddTransaction: () => void;
}

export function TransactionScreenHeader({
  onAddTransaction,
}: Readonly<TransactionScreenHeaderProps>) {
  const { t } = useTranslation();

  return (
    <Group>
      <Title order={2} flex={1}>
        {t("screens.transactions.list.header.title", "Transactions")}
      </Title>
      <Tooltip
        label={t(
          "screens.transactions.list.header.add.tooltip",
          "Add new transaction"
        )}
      >
        <ActionIcon
          variant="outline"
          onClick={() => {
            onAddTransaction();
          }}
        >
          <IconPlus style={{ width: "70%", height: "70%" }} stroke={1.5} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
