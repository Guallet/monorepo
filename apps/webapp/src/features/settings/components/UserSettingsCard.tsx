import { useUser } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import { Avatar, Box, Button, Card, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconLogout, IconUserCircle } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export function UserSettingsCard() {
  // TODO: Replace this with a prop callback rather than navigate directly from here
  const navigate = useNavigate();
  const { user } = useUser();
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();

  return (
    <Card withBorder shadow="sm" radius="lg" p={spacing.lg}>
      <Stack gap={spacing.md}>
        <Group gap={spacing.md} align="flex-start" wrap="nowrap">
          <ThemeIcon size={40} radius="md" variant="light" color="blue">
            <IconUserCircle size={24} strokeWidth={1.5} />
          </ThemeIcon>
          <Box>
            <Text fw={600}>
              {t('screens.settings.profile.title', 'User information')}
            </Text>
            <Text size="sm" c="dimmed" mt={spacing.xs}>
              {t(
                'screens.settings.profile.description',
                'Review your signed-in profile and account session.',
              )}
            </Text>
          </Box>
        </Group>

        <Group gap={spacing.md} wrap="nowrap">
        <Avatar
          src={user?.profile_src}
          alt={user?.name}
          size={72}
          radius="xl"
        />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text fw={700}>{user?.name}</Text>
            <Text size="sm" c="dimmed" truncate>
              {user?.email}
            </Text>
          </Box>
        </Group>

        <Button
          variant="outline"
          color="red"
          leftSection={<IconLogout size={16} strokeWidth={1.5} />}
          style={{
            borderColor: colors.error,
            color: colors.error,
            alignSelf: 'flex-start',
          }}
          onClick={() => {
            navigate({ to: '/logout' });
          }}
        >
          {t('screens.settings.profile.logoutButton.label', 'Log out')}
        </Button>
      </Stack>
    </Card>
  );
}
