import { Colors } from "@/theme/colors";
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
      <SearchBoxInput
        query={query}
        onSearchQueryChanged={(query) => {
          setQuery(query);
          onSearchQueryChanged(query);
        }}
      />
      <Button variant="outline" radius="xl" onClick={onAddNewAccount} bg={Colors.white}>
        Add new account
      </Button>
    </Group>
  );
}
