import { Button, Stack, Title, Text } from "@mantine/core";
import { ListView } from "../../components/ListView/ListView";

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
          return <Text key={item}>{`Item ${item + 1}: ${item}`}</Text>;
        }}
      />
    </Stack>
  );
}
