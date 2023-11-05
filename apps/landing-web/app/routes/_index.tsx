import { Button, Group, Text } from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";

export default function Index() {
  return (
    <Group>
      <Text>This is the main landing page for the project</Text>
      <Button>Click here to subscribe</Button>
    </Group>
  );
}
