import { Group, TextInput, Button } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

interface Props {
  onAddNewAccount: () => void;
}

export function AccountsHeader({ onAddNewAccount }: Props) {
  return (
    <Group justify="space-between">
      <TextInput
        placeholder="Search..."
        radius="xl"
        leftSection={<IconSearch />}
      />
      <Button variant="outline" radius="xl" onClick={onAddNewAccount}>
        Add new account
      </Button>
    </Group>
  );
}
