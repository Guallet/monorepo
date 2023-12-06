import { Group, Button } from "@mantine/core";
import { SearchBoxInput } from "@guallet/ui-react";

interface Props {
  onAddNewAccount: () => void;
  onSearchQueryChanged: (searchQuery: string) => void;
}

export function AccountsHeader({
  onAddNewAccount,
  onSearchQueryChanged,
}: Props) {
  return (
    <Group justify="space-between">
      <SearchBoxInput
        onSearchQueryChanged={(query) => {
          onSearchQueryChanged(query);
        }}
      />
      <Button variant="outline" radius="xl" onClick={onAddNewAccount}>
        Add new account
      </Button>
    </Group>
  );
}
