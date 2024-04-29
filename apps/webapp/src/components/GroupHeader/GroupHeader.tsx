import { Text, Group } from "@mantine/core";

interface Props {
  title: string;
  rightContent: string | null;
}

export default function GroupHeader({ title, rightContent }: Props) {
  return (
    <Group justify="space-between" pl="md" pr="md">
      <Text fw={700}>{title}</Text>
      <Text fw={700}>{rightContent}</Text>
    </Group>
  );
}
