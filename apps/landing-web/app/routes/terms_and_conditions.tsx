import { Button, Group, Text } from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Guallet - Terms and conditions" },
    // { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <Group>
      <Text>Terms and conditions</Text>
    </Group>
  );
}
