import { useTheme } from '@guallet/ui-react';
import {
  Box,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { ReactNode } from 'react';

interface EmptyStateAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: string;
}

interface EmptyStateTrait {
  title: string;
  body: string;
}

interface EmptyStateProps {
  illustration?: ReactNode;
  title: string;
  description?: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  traits?: EmptyStateTrait[];
  loading?: boolean;
}

export function EmptyState({
  illustration,
  title,
  description,
  primaryAction,
  secondaryAction,
  traits,
  loading = false,
}: Readonly<EmptyStateProps>) {
  const { spacing } = useTheme();
  const hasTraits = traits && traits.length > 0;
  const traitCols = traits && traits.length >= 3 ? 3 : (traits?.length ?? 1);

  return (
    <Box maw={720} mx="auto" pt={spacing.xl} pb={spacing.xxl}>
      <Paper
        withBorder
        shadow="sm"
        radius="lg"
        p={0}
        style={{ overflow: 'hidden', opacity: loading ? 0.7 : 1 }}
      >
        <Stack
          align="center"
          gap={spacing.xs}
          p={spacing.xl}
          style={{
            textAlign: 'center',
            borderBottom: hasTraits
              ? '1px solid var(--mantine-color-gray-2)'
              : undefined,
          }}
        >
          {loading ? (
            <Center>
              <Loader size={48} />
            </Center>
          ) : (
            illustration && <Center>{illustration}</Center>
          )}

          <Text
            fz={24}
            fw={700}
            mt={illustration ? spacing.md : 0}
            style={{ letterSpacing: '-0.01em' }}
          >
            {title}
          </Text>

          {description && (
            <Text size="sm" c="dimmed" maw={420} style={{ lineHeight: 1.6 }}>
              {description}
            </Text>
          )}

          {(primaryAction || secondaryAction) && !loading && (
            <Group
              justify="center"
              gap={spacing.xs}
              mt={spacing.md}
              wrap="wrap"
            >
              {primaryAction && (
                <Button
                  leftSection={primaryAction.icon}
                  onClick={primaryAction.onClick}
                  variant={primaryAction.variant}
                >
                  {primaryAction.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  onClick={secondaryAction.onClick}
                  variant={secondaryAction.variant ?? 'outline'}
                >
                  {secondaryAction.label}
                </Button>
              )}
            </Group>
          )}
        </Stack>

        {hasTraits && (
          <SimpleGrid cols={traitCols} p={spacing.md}>
            {traits.map((trait) => (
              <Stack key={trait.title} gap={4}>
                <Text size="sm" fw={700}>
                  {trait.title}
                </Text>
                <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
                  {trait.body}
                </Text>
              </Stack>
            ))}
          </SimpleGrid>
        )}
      </Paper>
    </Box>
  );
}
