import { AccountDto, AccountTypeDto } from "@guallet/api-client";
import { SearchBoxInput } from "@guallet/ui-react";
import {
  ActionIcon,
  Button,
  Checkbox,
  Group,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { AccountCheckbox } from "./AccountCheckbox";
import {
  IconClearAll,
  IconDeselect,
  IconSelect,
  IconSelectAll,
} from "@tabler/icons-react";
import { getAccountTypeTitle } from "../../models/Account";

interface AccountsPickerModalProps {
  accounts: AccountDto[];
  selectedAccounts: AccountDto[];
  onSelectAccounts: (accounts: AccountDto[]) => void;
  onCancel: () => void;
}

export function AccountPickerModal({
  accounts,
  selectedAccounts,
  onSelectAccounts,
  onCancel,
}: Readonly<AccountsPickerModalProps>) {
  const [query, setQuery] = useState("");
  const [filteredAccounts, setFilteredAccounts] =
    useState<AccountDto[]>(accounts);

  const [selectedIds, setSelectedIds] = useState(
    selectedAccounts.map((x) => x.id)
  );

  useEffect(() => {
    if (query === "" || query === null || query === undefined) {
      setFilteredAccounts(accounts);
    } else {
      const filtered = accounts.filter((account) => {
        return account.name.toLowerCase().includes(query.toLowerCase());
      });
      setFilteredAccounts(filtered);
    }
  }, [query, accounts]);

  const groupedAccounts = useMemo(() => {
    // const groups: Record<AccountTypeDto, AccountDto[]> = {};
    const groups: { type: AccountTypeDto; items: AccountDto[] }[] = [];
    filteredAccounts.forEach((account) => {
      const type = account.type;
      const group = groups.find((g) => g.type === type);
      if (group) {
        group.items.push(account);
      } else {
        groups.push({ type, items: [account] });
      }
    });

    return groups;
  }, [filteredAccounts]);

  function deselectAll() {
    setSelectedIds([]);
  }

  function selectAll() {
    setSelectedIds(accounts.map((x) => x.id));
  }

  return (
    <Stack w={"30em"}>
      <Group>
        <SearchBoxInput
          style={{ flexGrow: 1 }}
          query={query}
          onSearchQueryChanged={(newQuery) => {
            setQuery(newQuery);
          }}
        />
        <Tooltip label="Select all">
          <ActionIcon
            onClick={() => {
              selectAll();
            }}
          >
            <IconSelectAll />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Clear all">
          <ActionIcon
            onClick={() => {
              deselectAll();
            }}
          >
            <IconDeselect />
          </ActionIcon>
        </Tooltip>
      </Group>
      <ScrollArea.Autosize mah={300}>
        {filteredAccounts.length === 0 && <Text>No accounts found</Text>}
        <Checkbox.Group value={selectedIds} onChange={setSelectedIds}>
          {groupedAccounts.map(
            (group: { type: AccountTypeDto; items: AccountDto[] }) => (
              <Stack key={group.type}>
                <Text w={500}>{getAccountTypeTitle(group.type)}</Text>
                <Checkbox.Group value={selectedIds} onChange={setSelectedIds}>
                  {group.items.map((item) => (
                    <AccountCheckbox
                      key={item.id}
                      account={item}
                      style={{
                        marginBottom: "5px",
                      }}
                    />
                  ))}
                </Checkbox.Group>
              </Stack>
            )
          )}
        </Checkbox.Group>
      </ScrollArea.Autosize>
      <Group>
        <Button
          disabled={selectedIds.length === 0}
          onClick={() => {
            onSelectAccounts(
              accounts.filter((x) => selectedIds.includes(x.id))
            );
          }}
        >
          Select
        </Button>
        <Button onClick={() => onCancel()}>Cancel</Button>
      </Group>
    </Stack>
  );
}
