import { Card, Space, Stack, Text } from "@mantine/core";

interface AppSectionProps {
  title?: string;
  children: React.ReactNode;
}

export function AppSection({ title, children }: Readonly<AppSectionProps>) {
  return (
    <Stack
      style={{
        gap: "0",
      }}
    >
      {title && (
        <>
          <Text fw={700} pl="md" pr="md">
            {title}
          </Text>
          <Space h="xs" />
        </>
      )}

      <Card withBorder shadow="sm" radius="lg">
        <Stack>{children}</Stack>
      </Card>
    </Stack>
  );
}
