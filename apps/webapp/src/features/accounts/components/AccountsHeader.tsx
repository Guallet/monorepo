import { SearchBoxInput } from "@guallet/ui-react";
import { Group, Button } from "@mantine/core";
import { useState } from "react";

interface Props {
  onAddNewAccount: () => void;
  onSearchQueryChanged: (searchQuery: string) => void;
}

export function AccountsHeader({
  onAddNewAccount,
  onSearchQueryChanged,
}: Props) {
  const [query, setQuery] = useState("");

  return (
    <Group justify="space-between">
      TODO: Restore this view
      <SearchBoxInput
        onSearchQueryChanged={(query) => {
          setQuery(query);
          onSearchQueryChanged(query);
        }}
        query={query}
      />
      <Button variant="outline" radius="xl" onClick={onAddNewAccount}>
        Add new account
      </Button>
    </Group>
  );
}
