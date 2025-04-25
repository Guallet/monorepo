import { SearchBoxInput } from "@guallet/ui-react";
import { Group, Button } from "@mantine/core";
import { useState } from "react";

interface AccountsHeaderProps {
  onAddNewAccount: () => void;
  onSearchQueryChanged: (searchQuery: string) => void;
}

export function AccountsHeader({
  onAddNewAccount,
  onSearchQueryChanged,
}: Readonly<AccountsHeaderProps>) {
  const [query, setQuery] = useState("");

  return (
    <Group justify="space-between">
      <SearchBoxInput
        style={{ flexGrow: 1 }}
        query={query}
        onSearchQueryChanged={(query) => {
          setQuery(query);
          onSearchQueryChanged(query);
        }}
      />
      <Button onClick={onAddNewAccount}>Add new account</Button>
    </Group>
  );
}
