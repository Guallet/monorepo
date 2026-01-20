import { Card, Group, Text, Box, useMantineTheme } from "@mantine/core";
import React from "react";

interface WidgetCardProps extends React.ComponentProps<typeof Card> {
  onClick?: () => void;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function WidgetCard({
  onClick,
  title,
  children,
  icon,
  action,
  ...props
}: Readonly<WidgetCardProps>) {
  const theme = useMantineTheme();
  
  return (
    <Card 
      shadow="md" 
      padding="lg" 
      radius="lg" 
      withBorder 
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      styles={{
        root: {
          '&:hover': onClick ? {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows.xl,
          } : {},
        }
      }}
      {...props}
    >
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          {icon && <Box style={{ color: theme.colors.blue[6] }}>{icon}</Box>}
          <Text
            size="sm"
            fw={600}
            tt="uppercase"
            c="dimmed"
          >
            {title}
          </Text>
        </Group>
        {action && <Box>{action}</Box>}
      </Group>

      <Box style={{ flex: 1 }}>
        {children}
      </Box>
    </Card>
  );
}
