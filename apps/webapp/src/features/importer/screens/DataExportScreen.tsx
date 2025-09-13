import { BaseScreen } from "@/components/Screens/BaseScreen";
import { Stack, Title, Text, Button } from "@mantine/core";

export function DataExportScreen() {
  return (
    <BaseScreen>
      <Stack>
        <Title>Data Export</Title>
        <Text>Export all your data and transactions</Text>
        <Button>Export Data</Button>
      </Stack>
    </BaseScreen>
  );
}
