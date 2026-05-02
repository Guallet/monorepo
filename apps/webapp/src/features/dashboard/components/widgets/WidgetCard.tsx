import { Card, Group, Text, Box } from '@mantine/core';
import React from 'react';
import { useTheme } from '@guallet/ui-react';

interface WidgetCardProps extends React.ComponentProps<typeof Card> {
  onClick?: () => void;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
}

export function WidgetCard({
  onClick,
  title,
  children,
  icon,
  action,
  footer,
  ...props
}: Readonly<WidgetCardProps>) {
  const { colors } = useTheme();

  return (
    <Card
      shadow="md"
      padding="lg"
      radius="lg"
      withBorder
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition:
          'transform 150ms cubic-bezier(0.2, 0, 0, 1), box-shadow 150ms cubic-bezier(0.2, 0, 0, 1)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...props.style,
      }}
      styles={{
        root: {
          '&:hover': onClick
            ? {
                transform: 'translateY(-2px)',
                boxShadow:
                  '0 24px 48px rgba(0,0,0,.10), 0 4px 8px rgba(0,0,0,.04)',
              }
            : {},
        },
      }}
      {...props}
    >
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          {icon && <Box style={{ color: colors.primary }}>{icon}</Box>}
          <Text size="sm" fw={600} tt="uppercase" c="dimmed">
            {title}
          </Text>
        </Group>
        {action && <Box>{action}</Box>}
      </Group>

      <Box style={{ flex: 1 }}>{children}</Box>

      {footer && (
        <Box
          mt="md"
          pt="sm"
          style={{ borderTop: `1px solid ${colors.paleGrey}` }}
        >
          {footer}
        </Box>
      )}
    </Card>
  );
}
