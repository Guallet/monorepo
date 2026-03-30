import { Center, Loader, Paper, Stack, Text, UnstyledButton } from "@mantine/core";
import {
  GualletIcon,
  GualletIconName,
} from "@/components/GualletIcon/GualletIcon";

interface EmptyStateProps {
  iconName: GualletIconName;
  text: string;
  onClick: () => void;
  loading?: boolean;
}

export default function EmptyState({
  iconName,
  text,
  onClick,
  loading = false,
}: Readonly<EmptyStateProps>) {
  return (
    <UnstyledButton
      style={{ width: "100%", opacity: loading ? 0.6 : 1, cursor: loading ? "default" : "pointer" }}
      disabled={loading}
      onClick={() => {
        if (!loading) onClick();
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
            {loading ? (
              <Loader size={48} />
            ) : (
              <GualletIcon
                iconName={iconName}
                size={48}
                stroke={1.5}
                color="#9ca3af"
              />
            )}
            <Text size="lg" w={500} c="dark" ta="center">
              {text}
            </Text>
          </Stack>
        </Center>
      </Paper>
    </UnstyledButton>
  );
}
