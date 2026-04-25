import { Stack, Text } from '@mantine/core';

interface EmptyTraitProps {
  title: string;
  body: string;
}

export function EmptyTrait({ title, body }: Readonly<EmptyTraitProps>) {
  return (
    <Stack gap={4}>
      <Text size="sm" fw={700}>
        {title}
      </Text>
      <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
        {body}
      </Text>
    </Stack>
  );
}
