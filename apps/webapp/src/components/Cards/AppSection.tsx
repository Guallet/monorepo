import { Card, Space, Stack, Text } from "@mantine/core";

interface AppSectionProps extends React.ComponentProps<typeof Card> {
  title?: string;
  gap?: number | string;
  itemPadding?: number | string;
  children: React.ReactNode;
}

export function AppSection({
  title,
  children,
  itemPadding = "md",
  gap = "md",
  ...props
}: Readonly<AppSectionProps>) {
  return (
    <Stack gap={gap}>
      {title && (
        <>
          <Text fw={700} pl="md" pr="md">
            {title}
          </Text>
          <Space h="xs" />
        </>
      )}

      <Card withBorder shadow="sm" radius="lg" padding={itemPadding} {...props}>
        {children}
      </Card>
    </Stack>
  );
}
