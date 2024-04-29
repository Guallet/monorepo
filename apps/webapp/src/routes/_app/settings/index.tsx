import { ListView } from "@guallet/ui-react";
import { Button, Stack, Title, Text } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  return (
    <Stack>
      <Title>Settings</Title>
      <Button
        onClick={() => {
          navigate({ to: "/settings/institutions" });
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
