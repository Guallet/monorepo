import { Button, Group, Text } from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "Guallet - Privacy policy" }];
};

export default function Index() {
  return (
    <Group>
      <Text>Privacy policy</Text>
    </Group>
  );
}
