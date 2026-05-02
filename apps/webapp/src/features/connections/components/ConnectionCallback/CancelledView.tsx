import { useTheme } from '@guallet/ui-react';
import { Box, Button, Center, Stack, Text, Title } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface CancelledViewProps {
  onRetry: () => void;
  onBack: () => void;
}

export function CancelledView({ onRetry, onBack }: Readonly<CancelledViewProps>) {
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
            background: colors.paleGrey,
            border: `2px solid ${colors.midGrey}`,
          }}
        >
          <IconX size={36} color={colors.midGrey} />
        </Center>

        <Title order={4} ta="center">
          {t('screens.connections.callback.cancelled.title', 'Authorisation cancelled')}
        </Title>
        <Text size="sm" c="dimmed" ta="center" maw={360}>
          {t(
            'screens.connections.callback.cancelled.description',
            'No accounts were connected. You cancelled the authorisation. You can try again or add an account manually.',
          )}
        </Text>

        <Stack gap="xs" w="100%" maw={380}>
          <Button fullWidth onClick={onRetry}>
            {t('screens.connections.callback.cancelled.retry', 'Try connecting again')}
          </Button>
          <Button fullWidth variant="outline" onClick={onBack}>
            {t('screens.connections.callback.cancelled.manual', 'Add account manually')}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
