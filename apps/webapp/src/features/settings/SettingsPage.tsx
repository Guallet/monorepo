import { ListView } from "@guallet/ui-react";
import { Button, Stack, Title, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export function SettingsPage() {
  const navigate = useNavigate();
  return (
    <Stack>
      <Title>Settings</Title>
      <Button
        onClick={() => {
          navigate("/settings/institutions");
        }}
      >
        Manage institutions
      </Button>
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
