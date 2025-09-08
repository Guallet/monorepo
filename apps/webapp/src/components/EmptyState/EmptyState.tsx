import { Center, Paper, Stack, Text, UnstyledButton } from "@mantine/core";
import {
  GualletIcon,
  GualletIconName,
} from "@/components/GualletIcon/GualletIcon";

interface EmptyStateProps {
  iconName: GualletIconName;
  text: string;
  onClick: () => void;
}

export default function EmptyState({
  iconName,
  text,
  onClick,
}: Readonly<EmptyStateProps>) {
  return (
    <UnstyledButton
      style={{ width: "100%" }}
      onClick={() => {
        onClick();
      }}
    >
      <Paper shadow="sm" p="lg" radius="md" withBorder>
        <Center
          style={{
            borderRadius: 8,
            borderStyle: "dashed",
            borderWidth: 2,
            borderColor: "#d1d5db",
            padding: 40,
          }}
        >
          <Stack justify="center" align="center" gap="xs">
            <GualletIcon
              iconName={iconName}
              size={48}
              stroke={1.5}
              color="#9ca3af"
            />
            <Text size="lg" w={500} c="dark" ta="center">
              {text}
            </Text>
          </Stack>
        </Center>
      </Paper>
    </UnstyledButton>
  );
}
