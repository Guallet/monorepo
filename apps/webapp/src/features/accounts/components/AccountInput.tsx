import { useAccounts } from "@guallet/api-react";
import { Group, Select, SelectProps } from "@mantine/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getAccountTypeTitle } from "../models/Account";
import { AccountDto, AccountTypeDto } from "@guallet/api-client";
import { IconCheck } from "@tabler/icons-react";
import { AccountAvatar } from "@/components/AccountAvatar/AccountAvatar";

interface AccountInputProps extends React.ComponentProps<typeof Select> {}

export function AccountInput({ ...props }: AccountInputProps) {
  const { t } = useTranslation();

  const { accounts } = useAccounts();

  const groupedAccounts = useMemo(() => {
    const groups: Record<AccountTypeDto, AccountDto[]> = {};
    accounts.forEach((account) => {
      const type = account.type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(account);
    });

    return Object.entries(groups).map(([group, items]) => ({
      group: getAccountTypeTitle(group as AccountTypeDto),
      items: items.map((account) => ({
        value: account.id,
        label: account.name,
      })),
    }));
  }, [accounts]);

  const renderSelectOption: SelectProps["renderOption"] = ({
    option,
    checked,
  }) => (
    <Group flex="1" gap="xs" wrap="nowrap">
      <AccountAvatar accountId={option.value} size="sm" />
      {option.label}
      {checked && <IconCheck style={{ marginInlineStart: "auto" }} />}
    </Group>
  );

  return (
    <Select
      clearable
      label={t("components.accountInput.label", "Account")}
      placeholder={t(
        "components.accountInput.placeholder",
        "Select an account"
      )}
      data={groupedAccounts}
      searchable
      nothingFoundMessage={t(
        "components.accountInput.nothingFoundMessage",
        "No accounts found"
      )}
      //   leftSection={props.value && <AccountAvatar accountId={props.value} />}
      renderOption={renderSelectOption}
      {...props}
    />
  );
}
