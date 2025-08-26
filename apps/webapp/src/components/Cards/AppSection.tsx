import { Card, Space, Stack, Text } from "@mantine/core";

interface AppSectionProps extends React.ComponentProps<typeof Card> {
  title?: string;
  children: React.ReactNode;
}

export function AppSection({
  title,
  children,
  ...props
}: Readonly<AppSectionProps>) {
  return (
    <Stack gap={0}>
      {title && (
        <>
          <Text fw={700} pl="md" pr="md">
            {title}
          </Text>
          <Space h="xs" />
        </>
      )}

      <Card withBorder shadow="sm" radius="lg" {...props}>
        {children}
      </Card>
    </Stack>
  );
}
