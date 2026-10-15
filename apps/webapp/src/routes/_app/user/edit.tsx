import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useUser } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import { Box, Button, Card, Group, Stack, TextInput } from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_app/user/edit')({
  component: EditUserPage,
});

function EditUserPage() {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <BaseScreen title={t('screens.user.edit.title', 'Edit profile')}>
      <Box maw={560} mx="auto">
        <form method="post" id="edit-user-form">
          <Stack gap={spacing.md}>
            <Card
              withBorder
              shadow="sm"
              radius="lg"
              padding={{ base: 'md', sm: 'lg' }}
            >
              <Stack gap={spacing.md}>
                <TextInput
                  name="name"
                  required
                  label={t('screens.user.edit.fields.name.label', 'Name')}
                  placeholder={t(
                    'screens.user.edit.fields.name.placeholder',
                    'Enter your name',
                  )}
                  defaultValue={user?.name}
                />
                <TextInput
                  name="email"
                  required
                  label={t('screens.user.edit.fields.email.label', 'Email')}
                  placeholder={t(
                    'screens.user.edit.fields.email.placeholder',
                    'Enter your email',
                  )}
                  defaultValue={user?.email}
                />
              </Stack>
            </Card>

            <Stack gap="xs" hiddenFrom="sm">
              <Button type="submit" fullWidth size="md">
                {t('screens.user.edit.submitButton', 'Save changes')}
              </Button>
              <Button
                variant="outline"
                fullWidth
                size="md"
                onClick={() => navigate({ to: '/user' })}
              >
                {t('screens.user.edit.cancelButton', 'Cancel')}
              </Button>
            </Stack>
            <Group justify="flex-end" gap="xs" visibleFrom="sm">
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/user' })}
              >
                {t('screens.user.edit.cancelButton', 'Cancel')}
              </Button>
              <Button type="submit">
                {t('screens.user.edit.submitButton', 'Save changes')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Box>
    </BaseScreen>
  );
}
