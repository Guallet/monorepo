import { useTheme } from '@guallet/ui-react';
import { Box, Center, Group, Stack, Text } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

interface WizardProgressProps {
  steps: string[];
  current: number;
}

export function WizardProgress({ steps, current }: Readonly<WizardProgressProps>) {
  const { colors, spacing } = useTheme();

  return (
    <Group gap={0} mb="xl">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <Group
            key={i}
            gap={0}
            style={{ flex: i < steps.length - 1 ? 1 : 'none', alignItems: 'flex-start' }}
          >
            <Stack gap={spacing.xs} align="center" style={{ minWidth: 48 }}>
              <Center
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: done || active ? colors.primary : colors.paleGrey,
                  border: active ? `2px solid ${colors.primary}` : 'none',
                  boxShadow: active
                    ? `0 0 0 4px color-mix(in oklab, ${colors.primary} 18%, ${colors.white})`
                    : undefined,
                  transition: 'all 200ms',
                }}
              >
                {done ? (
                  <IconCheck size={12} color={colors.white} />
                ) : (
                  <Text size="xs" fw={700} c={active ? colors.white : 'dimmed'}>
                    {i + 1}
                  </Text>
                )}
              </Center>
              <Text
                size="xs"
                fw={active ? 600 : 400}
                c={active ? colors.primary : 'dimmed'}
                style={{ whiteSpace: 'nowrap' }}
              >
                {label}
              </Text>
            </Stack>
            {i < steps.length - 1 && (
              <Box
                style={{
                  flex: 1,
                  height: 2,
                  margin: `${spacing.md - 2}px ${spacing.xs}px 0`,
                  background: done ? colors.primary : colors.paleGrey,
                  minWidth: 16,
                  transition: 'background 300ms',
                }}
              />
            )}
          </Group>
        );
      })}
    </Group>
  );
}
