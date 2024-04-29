import { Account } from "@/features/accounts/models/Account";
import { SearchBoxInput } from "@guallet/ui-react";
import {
  Button,
  Checkbox,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { AccountCheckbox } from "./AccountCheckbox";

interface AccountsPickerProps {
  accounts: Account[];
  selectedAccounts: Account[];
  onSelectedAccountsChange: (accounts: Account[]) => void;
}

export function AccountsPicker({
  accounts,
  selectedAccounts,
  onSelectedAccountsChange,
}: AccountsPickerProps) {
  const isMobile = useMediaQuery("(max-width: 50em)");
  const [opened, { open, close }] = useDisclosure(false);

  let buttonCaption = "Select accounts";
  switch (selectedAccounts.length) {
    case 0:
      buttonCaption = "Select accounts";
      break;
    case 1:
      buttonCaption = `${selectedAccounts[0].name} selected`;
      break;
    case accounts.length:
      buttonCaption = `All accounts selected`;
      break;
    default:
      buttonCaption = `${selectedAccounts.length} accounts selected`;
  }

  return (
    <>
      <Modal
        opened={opened}
        fullScreen={isMobile}
        onClose={close}
        title="Select accounts"
        size="auto"
      >
        <AccountPickerModal
          accounts={accounts}
          selectedAccounts={selectedAccounts}
          onSelectAccounts={(selected) => {
            onSelectedAccountsChange(selected);
            close();
          }}
          onCancel={close}
        />
      </Modal>
      <Button variant="outline" onClick={open}>
        {buttonCaption}
      </Button>
    </>
  );
}

interface AccountsPickerModalProps {
  accounts: Account[];
  selectedAccounts: Account[];
  onSelectAccounts: (accounts: Account[]) => void;
  onCancel: () => void;
}
function AccountPickerModal({
  accounts,
  selectedAccounts,
  onSelectAccounts,
  onCancel,
}: AccountsPickerModalProps) {
  const [query, setQuery] = useState("");
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>(accounts);
  // array of strings value when multiple is true
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

  function deselectAll() {
    setSelectedIds([]);
  }

  function selectAll() {
    setSelectedIds(accounts.map((x) => x.id));
  }

  return (
    <Stack w={"30em"}>
      <SearchBoxInput
        query={query}
        onSearchQueryChanged={(newQuery) => {
          setQuery(newQuery);
        }}
      />
      <Group justify="flex-end">
        <Button
          variant="transparent"
          size="xs"
          onClick={() => {
            selectAll();
          }}
        >
          Select all
        </Button>
        <Button
          variant="transparent"
          size="xs"
          onClick={() => {
            deselectAll();
          }}
        >
          Clear all
        </Button>
      </Group>
      <ScrollArea.Autosize mah={300}>
        {filteredAccounts.length === 0 && <Text>No accounts found</Text>}
        <Checkbox.Group value={selectedIds} onChange={setSelectedIds}>
          {filteredAccounts.map((account) => (
            <AccountCheckbox
              key={account.id}
              account={account}
              style={{
                marginBottom: "5px",
              }}
            />
          ))}
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
