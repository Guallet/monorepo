import { Card, Group, Space, Stack, Text } from '@mantine/core';

interface AppSectionProps extends React.ComponentProps<typeof Card> {
  title?: string;
  itemPadding?: number | string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

export function AppSection({
  title,
  children,
  itemPadding = 'md',
  headerActions,
  ...props
}: Readonly<AppSectionProps>) {
  return (
    <Stack gap={0}>
      {title && (
        <>
          <Group>
            <Text fw={700} pl="md" pr="md" style={{ flex: 1 }}>
              {title}
            </Text>
            {headerActions}
          </Group>
          <Space h="xs" />
        </>
      )}

      <Card withBorder shadow="sm" radius="lg" padding={itemPadding} {...props}>
        {children}
      </Card>
    </Stack>
  );
}
