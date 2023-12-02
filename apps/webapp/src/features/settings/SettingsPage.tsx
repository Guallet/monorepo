import { Button, Stack, Title, Text } from "@mantine/core";

export function SettingsPage() {
  return (
    <Stack>
      <Title>Settings</Title>
      <Button>Export data</Button>
      <Text>Default Currency</Text>
      <Button color="red">Close account</Button>
    </Stack>
  );
}
