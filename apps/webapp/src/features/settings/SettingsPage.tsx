import { ListView } from "@guallet/ui-react";
import { Button, Stack, Title, Text } from "@mantine/core";

export function SettingsPage() {
  return (
    <Stack>
      <Title>Settings</Title>
      <Button>Export data</Button>
      <Text>Default Currency</Text>
      <Button color="red">Close account</Button>
      <ListView
        items={["hello", "world"]}
        itemTemplate={(item: string) => {
          return <Text key={item}>{`Item ${1}: ${item}`}</Text>;
        }}
      />
    </Stack>
  );
}
