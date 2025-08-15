import { Card, Group, rem, Text } from "@mantine/core";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconCoin,
} from "@tabler/icons-react";
import React from "react";

interface WidgetCardProps extends React.ComponentProps<typeof Card> {
  onClick?: () => void;
  title: string;
  children: React.ReactNode;
}

export function WidgetCard({
  onClick,
  title,
  children,
  ...props
}: Readonly<WidgetCardProps>) {
  const diff = 34;
  const DiffIcon = diff > 0 ? IconArrowUpRight : IconArrowDownRight;
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder {...props}>
      <Group justify="space-between">
        <Text
          size="xs"
          c="dimmed"
          style={{
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          {title}
        </Text>
        <IconCoin
          style={{
            color:
              "light-dark(var(--mantine-color-gray-4), var(--mantine-color-dark-3))",
          }}
          size={22}
          stroke={1.5}
        />
      </Group>

      {children}
    </Card>
  );
}
