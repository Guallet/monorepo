import { Text, Group } from "@mantine/core";
import { Colors } from "../../theme/colors";

interface Props {
  title: string;
  rightContent: string | null;
}

export default function GroupHeader({ title, rightContent }: Props) {
  return (
    <Group
      justify="space-between"
      p="md"
      style={{
        backgroundColor: Colors.primary,
      }}
    >
      <Text fw={700} c={Colors.text.light}>
        {title}
      </Text>
      <Text fw={700} c={Colors.text.light}>
        {rightContent}
      </Text>
    </Group>
  );
}
