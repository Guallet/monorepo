import { useTheme } from '@guallet/ui-react';
import { Box, Card, Group, Text, UnstyledButton } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

interface MethodCardProps {
  title: string;
  description: string;
  badge?: string;
  onClick: () => void;
  icon: ReactNode;
}

export function MethodCard({
  title,
  description,
  badge,
  onClick,
  icon,
}: Readonly<MethodCardProps>) {
  const { colors, borderRadius, spacing } = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <UnstyledButton
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width: '100%' }}
    >
      <Card
        withBorder
        radius="lg"
        p="lg"
        style={{
          border: `2px solid ${hovered ? colors.primary : colors.paleGrey}`,
          boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.06)',
          transform: hovered ? 'translateY(-2px)' : undefined,
          transition: 'all 150ms',
          cursor: 'pointer',
        }}
      >
        <Group gap="md" align="flex-start">
          {icon}
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group gap={spacing.sm} mb={spacing.xs}>
              <Text fw={700} size="md">
                {title}
              </Text>
              {badge && (
                <Text
                  size="xs"
                  fw={700}
                  style={{
                    padding: `${spacing.xs / 2}px ${spacing.sm}px`,
                    borderRadius: borderRadius.xl,
                    background: `color-mix(in oklab, ${colors.support} 14%, ${colors.white})`,
                    color: colors.darkSupport,
                    letterSpacing: '0.03em',
                  }}
                >
                  {badge}
                </Text>
              )}
            </Group>
            <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
              {description}
            </Text>
          </Box>
          <IconChevronRight
            size={20}
            color={hovered ? colors.primary : colors.midGrey}
            style={{ flexShrink: 0, transition: 'color 150ms' }}
          />
        </Group>
      </Card>
    </UnstyledButton>
  );
}
