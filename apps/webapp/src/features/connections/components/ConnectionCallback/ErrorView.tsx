import { useTheme } from '@guallet/ui-react';
import {
  Box,
  Button,
  Card,
  Center,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface ErrorViewProps {
  error: string;
  details?: string | null;
  onRetry: () => void;
  onBack: () => void;
}

export function ErrorView({ error, details, onRetry, onBack }: Readonly<ErrorViewProps>) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Box maw={560} mx="auto">
      <Stack align="center" py="xl">
        <Center
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: `color-mix(in oklab, ${colors.error} 10%, ${colors.white})`,
            border: `2px solid color-mix(in oklab, ${colors.error} 25%, ${colors.white})`,
          }}
        >
          <IconX size={36} color={colors.error} />
        </Center>

        <Title order={4} ta="center">
          {t('screens.connections.callback.error.connectionFailed', 'Connection failed')}
        </Title>
        <Text size="sm" c="dimmed" ta="center" maw={360}>
          {t(
            'screens.connections.callback.error.description',
            "Your bank rejected the connection request. This can happen if the session expired or the bank's Open Banking service is temporarily unavailable.",
          )}
        </Text>

        <Card withBorder radius="md" p="sm" w="100%" maw={380}>
          <Stack gap={4}>
            <Text size="xs" fw={700} c="dimmed">
              {t('screens.connections.callback.error.details', 'Error details')}
            </Text>
            <Text size="xs">{error}</Text>
            {details && (
              <Text size="xs" c="dimmed">
                {details}
              </Text>
            )}
          </Stack>
        </Card>

        <Card withBorder={false} bg="gray.0" radius="md" p="md" w="100%" maw={380}>
          <Text size="xs" fw={700} c="dimmed" mb="xs">
            {t('screens.connections.callback.error.whatToTry', 'What to try next')}
          </Text>
          <Stack gap="xs">
            {[
              t('screens.connections.callback.error.tip1', 'Check your bank app for any pending authorisation requests'),
              t('screens.connections.callback.error.tip2', 'Make sure you completed the login process before returning'),
              t('screens.connections.callback.error.tip3', "Try again — the bank's service may now be available"),
            ].map((tip, i) => (
              <Group key={i} gap="xs" align="flex-start">
                <Text size="xs" c="dimmed">
                  ·
                </Text>
                <Text size="xs" c="dimmed" style={{ flex: 1 }}>
                  {tip}
                </Text>
              </Group>
            ))}
          </Stack>
        </Card>

        <Stack gap="xs" w="100%" maw={380}>
          <Button fullWidth onClick={onRetry}>
            {t('screens.connections.callback.error.retry', 'Try again')}
          </Button>
          <Button fullWidth variant="outline" onClick={onBack}>
            {t('screens.connections.callback.error.manual', 'Add account manually instead')}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
