import { Group, TextInput, Button } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";

interface Props {
  onAddNewAccount: () => void;
  onSearchQueryChanged: (searchQuery: string) => void;
}

export function AccountsHeader({
  onAddNewAccount,
  onSearchQueryChanged,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Group justify="space-between">
      <TextInput
        placeholder="Search..."
        radius="xl"
        leftSection={<IconSearch />}
        value={searchQuery}
        onChange={(event) => {
          const query = event.currentTarget.value;
          setSearchQuery(query);
          onSearchQueryChanged(query);
        }}
      />
      <Button variant="outline" radius="xl" onClick={onAddNewAccount}>
        Add new account
      </Button>
    </Group>
  );
}
